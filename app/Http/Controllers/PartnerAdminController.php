<?php

namespace App\Http\Controllers;

use App\Models\DocumentRequirement;
use App\Models\PartnerApplication;
use App\Models\PartnerAuditLog;
use App\Models\PartnerCategory;
use App\Models\PartnerDocument;
use App\Models\PartnerBenefitReviewHistory;
use App\Models\ProposedPartnerBenefit;
use App\Models\User;
use App\Notifications\PartnerPortalNotification;
use App\Services\PartnerWorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PartnerAdminController extends Controller
{
    public function __construct(private readonly PartnerWorkflowService $workflow) {}

    public function index(Request $request): Response
    {
        $query = PartnerApplication::query()->with([
            'partner.category', 'partner.users', 'partner.locations',
            'partner.documents.requirement', 'partner.benefits', 'statusHistory.actor',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }
        if ($request->filled('category')) {
            $query->whereHas('partner', fn ($q) => $q->where('partner_category_id', $request->integer('category')));
        }
        if ($request->filled('location')) {
            $query->whereHas('partner.locations', fn ($q) => $q->where('region', 'like', '%'.$request->string('location')->toString().'%')
                ->orWhere('district', 'like', '%'.$request->string('location')->toString().'%'));
        }
        if ($request->filled('search')) {
            $term = '%'.$request->string('search')->toString().'%';
            $query->whereHas('partner', fn ($q) => $q->where('registered_name', 'like', $term)->orWhere('trading_name', 'like', $term));
        }

        return Inertia::render('Website/PartnerManagement', [
            'applications' => $query->latest('submitted_at')->paginate(20)->withQueryString()->through(fn (PartnerApplication $application) => $this->applicationData($application)),
            'selectedApplication' => null,
            'filters' => $request->only(['status', 'category', 'location', 'search']),
            'categories' => PartnerCategory::query()->orderBy('sort_order')->orderBy('name')->get(['id', 'name', 'slug', 'is_active']),
            'requirements' => DocumentRequirement::with('category:id,name')->orderBy('sort_order')->orderBy('label')->get(),
            'canManageRequirements' => $request->user()->isSuperAdmin(),
        ]);
    }

    public function show(Request $request, PartnerApplication $application): Response
    {
        $application->load(['partner.category', 'partner.users', 'partner.locations', 'partner.documents.requirement', 'partner.benefits', 'statusHistory.actor']);

        return Inertia::render('Website/PartnerManagement', [
            'applications' => PartnerApplication::query()->with(['partner.category', 'partner.users', 'partner.locations', 'partner.documents.requirement', 'partner.benefits', 'statusHistory.actor'])
                ->latest('submitted_at')->paginate(20)->withQueryString()->through(fn (PartnerApplication $item) => $this->applicationData($item)),
            'selectedApplication' => $this->applicationData($application),
            'filters' => $request->only(['status', 'category', 'location', 'search']),
            'categories' => PartnerCategory::query()->orderBy('sort_order')->orderBy('name')->get(['id', 'name', 'slug', 'is_active']),
            'requirements' => DocumentRequirement::with('category:id,name')->orderBy('sort_order')->orderBy('label')->get(),
            'canManageRequirements' => $request->user()->isSuperAdmin(),
        ]);
    }

    public function underReview(Request $request, PartnerApplication $application): RedirectResponse
    {
        abort_unless(in_array($application->status, ['submitted', 'action_required'], true), 422, 'Only submitted applications can enter review.');
        DB::transaction(fn () => $this->workflow->transition($application, 'under_review', $request->user(), 'Application review started.', $request));
        $this->workflow->notifyPartner($application->fresh('partner.users'), 'Application under review', 'A RAVU reviewer has started reviewing your application.');

        return back()->with('success', 'Application marked under review.');
    }

    public function requestChanges(Request $request, PartnerApplication $application): RedirectResponse
    {
        $data = $request->validate(['comment' => ['required', 'string', 'min:10', 'max:3000']]);
        abort_unless(in_array($application->status, ['submitted', 'under_review', 'action_required'], true), 422, 'This application cannot be sent for corrections in its current state.');

        DB::transaction(fn () => $this->workflow->transition($application, 'action_required', $request->user(), trim($data['comment']), $request));
        $this->workflow->notifyPartner($application->fresh('partner.users'), 'Action required on your application', trim($data['comment']));

        return back()->with('success', 'Correction request sent to the partner.');
    }

    public function approve(Request $request, PartnerApplication $application): RedirectResponse
    {
        abort_unless(in_array($application->status, ['submitted', 'under_review'], true), 422, 'Only a submitted application can be approved.');
        $partner = $application->partner;
        $requirements = DocumentRequirement::query()->where('is_active', true)->where('is_required', true)
            ->where(fn ($query) => $query->whereNull('partner_category_id')->orWhere('partner_category_id', $partner->partner_category_id))->get();
        foreach ($requirements as $requirement) {
            $verifiedQuery = $partner->documents()->where('document_type', $requirement->document_type)
                ->whereNull('superseded_at')->where('status', 'verified')
                ->where(fn ($query) => $query->whereNull('expires_at')->orWhereDate('expires_at', '>=', today()));
            if ($requirement->requires_expiry_date) {
                $verifiedQuery->whereNotNull('expires_at');
            }
            $verified = $verifiedQuery->exists();
            if (! $verified) {
                throw ValidationException::withMessages(['documents' => "Verify the {$requirement->label} before approving this application."]);
            }
        }

        DB::transaction(function () use ($application, $request) {
            $application->update(['reviewed_by' => $request->user()->id, 'approved_at' => now(), 'resubmission_allowed' => false]);
            $this->workflow->transition($application, 'approved', $request->user(), 'Partner application approved.', $request);
        });
        $this->workflow->notifyPartner($application->fresh('partner.users'), 'RAVU partnership approved', 'Your business is now an approved RAVU partner. Your proposed benefit remains subject to its separate approval status.');

        return back()->with('success', 'Partner application approved.');
    }

    public function reject(Request $request, PartnerApplication $application): RedirectResponse
    {
        $data = $request->validate([
            'comment' => ['required', 'string', 'min:10', 'max:3000'],
            'resubmission_allowed' => ['required', 'boolean'],
        ]);
        abort_unless(in_array($application->status, ['submitted', 'under_review', 'action_required'], true), 422, 'This application cannot be rejected in its current state.');

        DB::transaction(function () use ($application, $request, $data) {
            $application->update(['reviewed_by' => $request->user()->id, 'resubmission_allowed' => $data['resubmission_allowed']]);
            $this->workflow->transition($application, 'rejected', $request->user(), trim($data['comment']), $request);
        });
        $this->workflow->notifyPartner($application->fresh('partner.users'), 'RAVU application decision', trim($data['comment']));

        return back()->with('success', 'Application decision sent to the partner.');
    }

    public function suspend(Request $request, PartnerApplication $application): RedirectResponse
    {
        $data = $request->validate(['comment' => ['required', 'string', 'min:10', 'max:3000']]);
        abort_unless($application->status === 'approved', 422, 'Only active partners can be suspended.');

        DB::transaction(fn () => $this->workflow->transition($application, 'suspended', $request->user(), trim($data['comment']), $request));
        $this->workflow->notifyPartner($application->fresh('partner.users'), 'RAVU partnership suspended', trim($data['comment']));

        return back()->with('success', 'Partner suspended and notified.');
    }

    public function reviewDocument(Request $request, PartnerDocument $document): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:verified,rejected,replacement_required'],
            'comment' => ['nullable', 'string', 'max:3000', 'required_if:status,rejected,replacement_required'],
        ]);
        if ($data['status'] === 'verified' && $document->expires_at && $document->expires_at->lt(today())) {
            throw ValidationException::withMessages(['status' => 'This document is expired and cannot be verified.']);
        }

        $document->update([
            'status' => $data['status'],
            'reviewed_by' => $request->user()->id,
            'review_comments' => $data['comment'] ?? null,
            'verified_at' => $data['status'] === 'verified' ? now() : null,
        ]);
        PartnerAuditLog::create([
            'partner_id' => $document->partner_id,
            'user_id' => $request->user()->id,
            'action' => 'document_reviewed',
            'subject_type' => PartnerDocument::class,
            'subject_id' => $document->id,
            'details' => ['status' => $data['status'], 'comment' => $data['comment'] ?? null],
            'ip_address' => $request->ip(),
        ]);

        $message = $data['status'] === 'verified'
            ? "Your {$document->requirement?->label} was verified."
            : "Your {$document->requirement?->label} needs attention: ".($data['comment'] ?? 'Please review the document.');
        $this->workflow->notifyPartner($document->application->fresh('partner.users'), 'Business document reviewed', $message);

        return back()->with('success', 'Document review saved.');
    }

    public function downloadDocument(Request $request, PartnerDocument $document): StreamedResponse
    {
        abort_unless(Storage::disk('local')->exists($document->storage_path), 404);

        return Storage::disk('local')->download($document->storage_path, $document->original_filename, ['Content-Type' => $document->mime_type]);
    }

    public function reviewBenefit(Request $request, ProposedPartnerBenefit $benefit): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:approved,rejected,replacement_required'],
            'comment' => ['nullable', 'string', 'max:3000', 'required_if:status,rejected,replacement_required'],
        ]);
        $previous = $benefit->status;
        DB::transaction(function () use ($benefit, $data, $request, $previous) {
            $benefit->update([
                'status' => $data['status'],
                'reviewed_by' => $request->user()->id,
                'review_comments' => $data['comment'] ?? null,
                'approved_at' => $data['status'] === 'approved' ? now() : null,
            ]);
            PartnerBenefitReviewHistory::create([
                'proposed_partner_benefit_id' => $benefit->id,
                'previous_status' => $previous,
                'new_status' => $data['status'],
                'changed_by' => $request->user()->id,
                'comment' => $data['comment'] ?? null,
            ]);
            PartnerAuditLog::create([
                'partner_id' => $benefit->partner_id,
                'user_id' => $request->user()->id,
                'action' => 'benefit_reviewed',
                'subject_type' => ProposedPartnerBenefit::class,
                'subject_id' => $benefit->id,
                'details' => ['status' => $data['status'], 'comment' => $data['comment'] ?? null],
                'ip_address' => $request->ip(),
            ]);
        });
        $this->workflow->notifyPartner($benefit->application()->with('partner.users')->first(), 'Proposed benefit reviewed', $data['status'] === 'approved' ? 'Your proposed member benefit was approved.' : 'Your proposed benefit needs changes: '.($data['comment'] ?? 'Please review your application.'));

        return back()->with('success', 'Benefit review saved.');
    }

    public function storeCategory(Request $request): RedirectResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403);
        $data = $request->validate(['name' => ['required', 'string', 'max:120'], 'slug' => ['required', 'alpha_dash', 'max:120', 'unique:partner_categories,slug'], 'description' => ['nullable', 'string', 'max:1000']]);
        PartnerCategory::create($data + ['is_active' => true]);

        return back()->with('success', 'Business category added.');
    }

    public function updateCategory(Request $request, PartnerCategory $category): RedirectResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403);
        $data = $request->validate(['name' => ['required', 'string', 'max:120'], 'slug' => ['required', 'alpha_dash', 'max:120', 'unique:partner_categories,slug,'.$category->id], 'description' => ['nullable', 'string', 'max:1000'], 'is_active' => ['required', 'boolean']]);
        $category->update($data);

        return back()->with('success', 'Business category updated.');
    }

    public function storeRequirement(Request $request): RedirectResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403);
        $data = $request->validate([
            'partner_category_id' => ['nullable', 'integer', 'exists:partner_categories,id'],
            'document_type' => ['required', 'alpha_dash', 'max:80'],
            'label' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_required' => ['required', 'boolean'],
            'requires_expiry_date' => ['required', 'boolean'],
        ]);
        abort_if(DocumentRequirement::where('partner_category_id', $data['partner_category_id'] ?? null)->where('document_type', $data['document_type'])->exists(), 422, 'This document requirement already exists for that scope.');
        DocumentRequirement::create($data + ['is_active' => true]);

        return back()->with('success', 'Document requirement added.');
    }

    public function updateRequirement(Request $request, DocumentRequirement $requirement): RedirectResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403);
        $data = $request->validate([
            'label' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_required' => ['required', 'boolean'],
            'requires_expiry_date' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
        ]);
        $requirement->update($data);

        return back()->with('success', 'Document requirement updated.');
    }

    private function applicationData(PartnerApplication $application): array
    {
        $partner = $application->partner;
        $owner = $partner->users->firstWhere('pivot.role', 'owner') ?? $partner->users->first();

        return [
            'id' => $application->id,
            'status' => $application->status,
            'version' => $application->version,
            'submitted_at' => $application->submitted_at?->toIso8601String(),
            'approved_at' => $application->approved_at?->toIso8601String(),
            'resubmission_allowed' => $application->resubmission_allowed,
            'partner' => [
                'id' => $partner->id,
                'registered_name' => $partner->registered_name,
                'trading_name' => $partner->trading_name,
                'registration_number' => $partner->registration_number,
                'tin_number' => $partner->tin_number,
                'business_description' => $partner->business_description,
                'year_established' => $partner->year_established,
                'website' => $partner->website,
                'status' => $partner->status,
                'category' => $partner->category?->name,
            ],
            'contact' => $owner ? [
                'name' => $owner->name,
                'position' => $owner->position,
                'email' => $owner->email,
                'phone' => $owner->phone,
                'preferred_communication' => $owner->preferred_communication,
            ] : null,
            'location' => $partner->locations->firstWhere('is_primary', true)?->only(['country', 'region', 'district', 'ward', 'physical_address', 'business_phone', 'operating_hours', 'latitude', 'longitude']),
            'documents' => $partner->documents->whereNull('superseded_at')->map(fn (PartnerDocument $document) => [
                'id' => $document->id,
                'type' => $document->requirement?->label ?? $document->document_type,
                'filename' => $document->original_filename,
                'uploaded_at' => $document->created_at?->toIso8601String(),
                'expires_at' => $document->expires_at?->toDateString(),
                'status' => $document->expires_at && $document->expires_at->lt(today()) ? 'expired' : $document->status,
                'comments' => $document->review_comments,
                'download_url' => route('partner-management.documents.download', $document),
            ])->values(),
            'benefits' => $partner->benefits->where('partner_application_id', $application->id)->map(fn (ProposedPartnerBenefit $benefit) => [
                'id' => $benefit->id,
                'name' => $benefit->name,
                'description' => $benefit->description,
                'type' => $benefit->benefit_type,
                'discount_percentage' => $benefit->discount_percentage,
                'discount_amount' => $benefit->discount_amount,
                'currency' => $benefit->currency,
                'products_or_services' => $benefit->products_or_services,
                'starts_at' => $benefit->starts_at?->toDateString(),
                'expires_at' => $benefit->expires_at?->toDateString(),
                'terms_and_conditions' => $benefit->terms_and_conditions,
                'redemption_instructions' => $benefit->redemption_instructions,
                'status' => $benefit->status,
                'review_comments' => $benefit->review_comments,
            ])->values(),
            'history' => $application->statusHistory->map(fn ($entry) => [
                'previous_status' => $entry->previous_status,
                'new_status' => $entry->new_status,
                'actor' => $entry->actor?->name ?? 'RAVU',
                'comment' => $entry->comment,
                'created_at' => $entry->created_at?->toIso8601String(),
            ]),
        ];
    }
}
