<?php

namespace App\Http\Controllers;

use App\Models\DocumentRequirement;
use App\Models\Partner;
use App\Models\PartnerApplication;
use App\Models\PartnerAuditLog;
use App\Models\PartnerDocument;
use App\Models\PartnerLocation;
use App\Models\PartnerCategory;
use App\Models\ProposedPartnerBenefit;
use App\Models\User;
use App\Notifications\PartnerPortalNotification;
use App\Services\PartnerWorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PartnerOnboardingController extends Controller
{
    public function __construct(private readonly PartnerWorkflowService $workflow) {}

    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        $partner = $user->primaryPartner();
        abort_unless($partner, 404);
        $application = $partner->application;
        abort_unless($application, 404);

        $requirements = DocumentRequirement::query()
            ->where('is_active', true)
            ->where(fn ($query) => $query->whereNull('partner_category_id')->orWhere('partner_category_id', $partner->partner_category_id))
            ->orderBy('sort_order')->orderBy('label')->get();

        $documents = $partner->documents()->whereNull('superseded_at')->latest()->get()->map(fn (PartnerDocument $document) => [
            'id' => $document->id,
            'document_type' => $document->document_type,
            'original_filename' => $document->original_filename,
            'uploaded_at' => $document->created_at?->toIso8601String(),
            'expires_at' => $document->expires_at?->toDateString(),
            'status' => $document->expires_at && $document->expires_at->lt(today()) ? 'expired' : $document->status,
            'review_comments' => $document->review_comments,
            'download_url' => route('partner.documents.download', $document),
        ]);

        $history = $application->statusHistory()->with('actor:id,name')->get()->map(fn ($entry) => [
            'previous_status' => $entry->previous_status,
            'new_status' => $entry->new_status,
            'comment' => $entry->comment,
            'actor' => $entry->actor?->name ?? 'RAVU',
            'created_at' => $entry->created_at?->toIso8601String(),
        ]);

        $benefit = $partner->benefits()->where('partner_application_id', $application->id)->latest()->first();
        $location = $partner->locations()->where('is_primary', true)->first();
        $profileComplete = filled($partner->registered_name)
            && filled($partner->registration_number)
            && filled($partner->tin_number)
            && filled($partner->business_description)
            && $partner->partner_category_id;
        $uploadedTypes = $documents->filter(fn (array $document) => ! in_array($document['status'], ['rejected', 'expired', 'replacement_required'], true))
            ->pluck('document_type')->unique()->all();
        $missingRequirements = $requirements->where('is_required', true)
            ->filter(fn (DocumentRequirement $requirement) => ! in_array($requirement->document_type, $uploadedTypes, true))
            ->values()->map(fn (DocumentRequirement $requirement) => $requirement->only(['document_type', 'label']))->all();
        $progress = [
            'business' => (bool) $profileComplete,
            'documents' => count($missingRequirements) === 0,
            'location' => (bool) $location,
            'benefit' => (bool) $benefit,
            'review' => $application->status !== 'draft',
            'missing_documents' => $missingRequirements,
        ];
        $canEdit = in_array($application->status, ['draft', 'action_required'], true)
            || ($application->status === 'rejected' && $application->resubmission_allowed);

        return Inertia::render('Website/PartnerDashboard', [
            'partner' => [
                'id' => $partner->id,
                'registered_name' => $partner->registered_name,
                'trading_name' => $partner->trading_name,
                'registration_number' => $partner->registration_number,
                'tin_number' => $partner->tin_number,
                'category_id' => $partner->partner_category_id,
                'category_name' => $partner->category?->name,
                'business_description' => $partner->business_description,
                'year_established' => $partner->year_established,
                'website' => $partner->website,
                'social_links' => $partner->social_links ?? [],
                'status' => $partner->status,
            ],
            'application' => [
                'id' => $application->id,
                'status' => $application->status,
                'version' => $application->version,
                'submitted_at' => $application->submitted_at?->toIso8601String(),
                'approved_at' => $application->approved_at?->toIso8601String(),
                'resubmission_allowed' => $application->resubmission_allowed,
            ],
            'contact' => [
                'name' => $user->name,
                'position' => $user->position,
                'email' => $user->email,
                'phone' => $user->phone,
                'preferred_communication' => $user->preferred_communication,
            ],
            'categories' => PartnerCategory::query()->where('is_active', true)->orderBy('sort_order')->orderBy('name')->get(['id', 'name']),
            'requirements' => $requirements->map(fn (DocumentRequirement $requirement) => [
                'id' => $requirement->id,
                'document_type' => $requirement->document_type,
                'label' => $requirement->label,
                'description' => $requirement->description,
                'is_required' => $requirement->is_required,
                'requires_expiry_date' => $requirement->requires_expiry_date,
            ]),
            'documents' => $documents,
            'location' => $location?->only(['id', 'country', 'region', 'district', 'ward', 'physical_address', 'business_phone', 'operating_hours', 'latitude', 'longitude']),
            'benefit' => $benefit?->only(['id', 'name', 'description', 'benefit_type', 'discount_percentage', 'discount_amount', 'currency', 'products_or_services', 'starts_at', 'expires_at', 'terms_and_conditions', 'redemption_instructions', 'status', 'review_comments']),
            'history' => $history,
            'progress' => $progress,
            'canEdit' => $canEdit,
            'notifications' => $user->notifications()->latest()->limit(10)->get()->map(fn ($notification) => [
                'id' => $notification->id,
                'data' => $notification->data,
                'read_at' => $notification->read_at?->toIso8601String(),
                'created_at' => $notification->created_at?->toIso8601String(),
            ]),
            'policyLinks' => [
                'terms' => config('partner.terms_url'),
                'privacy' => config('partner.privacy_url'),
                'terms_version' => config('partner.terms_version', 'v1'),
                'privacy_version' => config('partner.privacy_version', 'v1'),
            ],
        ]);
    }

    public function saveBusiness(Request $request): RedirectResponse
    {
        $partner = $this->editablePartner($request->user());
        $data = $request->validate([
            'registered_name' => ['nullable', 'string', 'max:255'],
            'trading_name' => ['nullable', 'string', 'max:255'],
            'registration_number' => ['nullable', 'string', 'max:100'],
            'tin_number' => ['nullable', 'string', 'max:100'],
            'partner_category_id' => ['nullable', 'integer', 'exists:partner_categories,id'],
            'business_description' => ['nullable', 'string', 'max:5000'],
            'year_established' => ['nullable', 'integer', 'min:1800', 'max:'.now()->year],
            'website' => ['nullable', 'url', 'max:255'],
            'social_links' => ['nullable', 'array'],
            'social_links.*' => ['nullable', 'url', 'max:255'],
        ]);

        if (! empty($data['partner_category_id'])) {
            abort_unless(PartnerCategory::whereKey($data['partner_category_id'])->where('is_active', true)->exists(), 422, 'Select an active business category.');
        }

        $partner->update($data);
        $this->audit($partner, $request->user(), 'business_profile_saved', $request);

        return back()->with('success', 'Business information saved.');
    }

    public function saveAccount(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:50'],
            'preferred_communication' => ['required', 'in:email,phone,whatsapp'],
        ]);
        $request->user()->update($data);

        return back()->with('success', 'Account contact details updated.');
    }

    public function saveLocation(Request $request): RedirectResponse
    {
        $partner = $this->editablePartner($request->user());
        $data = $request->validate([
            'country' => ['required', 'string', 'max:100'],
            'region' => ['required', 'string', 'max:120'],
            'district' => ['required', 'string', 'max:120'],
            'ward' => ['nullable', 'string', 'max:120'],
            'physical_address' => ['required', 'string', 'max:1000'],
            'business_phone' => ['nullable', 'string', 'max:50'],
            'operating_hours' => ['nullable', 'array'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        $partner->locations()->updateOrCreate(['is_primary' => true], [...$data, 'name' => 'Main location', 'is_primary' => true]);
        $this->audit($partner, $request->user(), 'primary_location_saved', $request);

        return back()->with('success', 'Primary business location saved.');
    }

    public function saveBenefit(Request $request): RedirectResponse
    {
        $partner = $this->editablePartner($request->user());
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:3000'],
            'benefit_type' => ['required', 'in:percentage_discount,fixed_discount,special_pricing,free_service,priority_service,other'],
            'discount_percentage' => ['nullable', 'numeric', 'gt:0', 'lte:100', 'required_if:benefit_type,percentage_discount'],
            'discount_amount' => ['nullable', 'numeric', 'gt:0', 'required_if:benefit_type,fixed_discount'],
            'currency' => ['nullable', 'in:TZS'],
            'products_or_services' => ['nullable', 'string', 'max:2000'],
            'partner_location_id' => ['nullable', 'integer', 'exists:partner_locations,id'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'terms_and_conditions' => ['nullable', 'string', 'max:3000'],
            'redemption_instructions' => ['nullable', 'string', 'max:2000'],
        ]);

        if (! empty($data['partner_location_id'])) {
            abort_unless($partner->locations()->whereKey($data['partner_location_id'])->exists(), 404);
        }

        $application = $partner->application;
        $benefit = $partner->benefits()->where('partner_application_id', $application->id)->latest()->first();
        if ($benefit && $benefit->status === 'approved') {
            abort(403, 'An approved benefit cannot be edited from the application. Contact RAVU to propose a change.');
        }
        $benefit ??= new ProposedPartnerBenefit(['partner_id' => $partner->id, 'partner_application_id' => $application->id]);
        $benefit->fill([...$data, 'status' => 'draft']);
        $benefit->save();
        $this->audit($partner, $request->user(), 'benefit_proposal_saved', $request);

        return back()->with('success', 'Proposed member benefit saved. RAVU will review it with your application.');
    }

    public function uploadDocument(Request $request): RedirectResponse
    {
        $partner = $this->editablePartner($request->user());
        $data = $request->validate([
            'document_type' => ['required', 'string', 'max:80'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:today'],
        ]);

        $requirement = DocumentRequirement::query()
            ->where('document_type', $data['document_type'])
            ->where('is_active', true)
            ->where(fn ($query) => $query->whereNull('partner_category_id')->orWhere('partner_category_id', $partner->partner_category_id))
            ->firstOrFail();
        if ($requirement->requires_expiry_date && empty($data['expires_at'])) {
            throw ValidationException::withMessages(['expires_at' => 'Add the expiry date shown on this document.']);
        }

        $file = $request->file('file');
        $filename = Str::uuid().'.'.$file->extension();
        $path = $file->storeAs("partners/{$partner->id}/documents", $filename, 'local');
        abort_unless($path, 500, 'The document could not be stored. Please try again.');

        $previous = $partner->documents()->where('document_type', $requirement->document_type)->whereNull('superseded_at')->latest()->first();
        DB::transaction(function () use ($partner, $requirement, $file, $filename, $path, $data, $previous, $request) {
            if ($previous) {
                $previous->update(['superseded_at' => now()]);
            }
            PartnerDocument::create([
                'partner_id' => $partner->id,
                'partner_application_id' => $partner->application->id,
                'document_requirement_id' => $requirement->id,
                'uploaded_by' => $request->user()->id,
                'replaces_document_id' => $previous?->id,
                'document_type' => $requirement->document_type,
                'original_filename' => $file->getClientOriginalName(),
                'storage_path' => $path,
                'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
                'file_size' => $file->getSize(),
                'expires_at' => $data['expires_at'] ?? null,
                'status' => 'pending_review',
            ]);
            $this->audit($partner, $request->user(), 'document_uploaded', $request, ['document_type' => $requirement->document_type, 'filename' => $file->getClientOriginalName()]);
        });

        return back()->with('success', 'Document uploaded securely and sent for review.');
    }

    public function downloadDocument(Request $request, PartnerDocument $document): StreamedResponse
    {
        $partner = $request->user()->primaryPartner();
        abort_unless($partner && $document->partner_id === $partner->id, 404);
        abort_unless(Storage::disk('local')->exists($document->storage_path), 404);

        return Storage::disk('local')->download($document->storage_path, $document->original_filename, ['Content-Type' => $document->mime_type]);
    }

    public function submit(Request $request): RedirectResponse
    {
        $partner = $this->editablePartner($request->user());
        $partner->load(['category', 'locations', 'documents', 'benefits']);
        $application = $partner->application;
        $wasResubmission = in_array($application->status, ['action_required', 'rejected'], true);
        if (in_array($application->status, ['submitted', 'under_review', 'approved', 'suspended', 'expired'], true)) {
            throw ValidationException::withMessages(['application' => 'This application is already submitted and cannot be submitted again.']);
        }

        $errors = [];
        if (! $partner->registered_name || ! $partner->registration_number || ! $partner->tin_number || ! $partner->business_description || ! $partner->partner_category_id) {
            $errors['business'] = 'Complete the required business information first.';
        }
        if (! $partner->locations()->where('is_primary', true)->exists()) {
            $errors['location'] = 'Add your primary business location before submitting.';
        }
        if (! $partner->benefits()->where('partner_application_id', $application->id)->exists()) {
            $errors['benefit'] = 'Propose at least one member benefit before submitting.';
        }

        $requirements = DocumentRequirement::query()
            ->where('is_active', true)->where('is_required', true)
            ->where(fn ($query) => $query->whereNull('partner_category_id')->orWhere('partner_category_id', $partner->partner_category_id))
            ->get();
        foreach ($requirements as $requirement) {
            $documentQuery = $partner->documents()->where('document_type', $requirement->document_type)
                ->whereNull('superseded_at')->whereNotIn('status', ['rejected', 'expired', 'replacement_required'])
                ->where(fn ($query) => $query->whereNull('expires_at')->orWhereDate('expires_at', '>=', today()));
            if ($requirement->requires_expiry_date) {
                $documentQuery->whereNotNull('expires_at');
            }
            $hasDocument = $documentQuery->exists();
            if (! $hasDocument) {
                $errors['documents'] = 'Upload the required document: '.$requirement->label.'.';
                break;
            }
        }

        if ($errors) {
            throw ValidationException::withMessages($errors);
        }

        $snapshot = [
            'partner' => $partner->only(['registered_name', 'trading_name', 'registration_number', 'tin_number', 'partner_category_id', 'business_description', 'year_established', 'website', 'social_links']),
            'location' => $partner->locations()->where('is_primary', true)->first()?->only(['country', 'region', 'district', 'ward', 'physical_address', 'business_phone', 'operating_hours', 'latitude', 'longitude']),
            'benefits' => $partner->benefits()->where('partner_application_id', $application->id)->get()->map(fn ($benefit) => $benefit->only(['name', 'description', 'benefit_type', 'discount_percentage', 'discount_amount', 'currency', 'products_or_services', 'starts_at', 'expires_at', 'terms_and_conditions', 'redemption_instructions']))->all(),
            'documents' => $partner->documents()->whereNull('superseded_at')->get()->map(fn ($document) => $document->only(['document_type', 'original_filename', 'expires_at', 'status']))->all(),
        ];

        DB::transaction(function () use ($application, $snapshot, $request, $partner) {
            if (in_array($application->status, ['action_required', 'rejected'], true)) {
                $application->increment('version');
            }
            $application->update(['submitted_snapshot' => $snapshot, 'submitted_at' => now(), 'reviewed_by' => null]);
            $partner->benefits()->where('partner_application_id', $application->id)->where('status', 'draft')->update(['status' => 'pending_review']);
            $this->workflow->transition($application, 'submitted', $request->user(), 'Application submitted for RAVU review.', $request);
        });

        $this->workflow->notifyPartner($application->fresh('partner.users'), 'Application submitted', 'Your RAVU partner application has been submitted for review.');
        $this->workflow->notifyReviewers(
            $application->fresh('partner'),
            $wasResubmission ? 'Partner application resubmitted' : 'New partner application',
            $wasResubmission ? 'A business has resubmitted its corrected partner application.' : 'A business has submitted a partner application for review.',
        );

        return back()->with('success', 'Your application has been submitted. RAVU will review it and send you an update.');
    }

    public function markNotificationRead(Request $request, string $notification): RedirectResponse
    {
        $item = $request->user()->notifications()->whereKey($notification)->firstOrFail();
        $item->markAsRead();

        return back();
    }

    private function editablePartner(User $user): Partner
    {
        $partner = $user->primaryPartner();
        abort_unless($partner, 404);
        $application = $partner->application;
        abort_unless($application, 404);

        if ($application->status === 'rejected' && ! $application->resubmission_allowed) {
            abort(403, 'RAVU has not allowed this application to be resubmitted.');
        }
        if (! in_array($application->status, ['draft', 'action_required', 'rejected'], true)) {
            abort(403, 'Your application is under review or approved and cannot be edited right now.');
        }

        return $partner;
    }

    private function audit(Partner $partner, User $user, string $action, Request $request, array $details = []): void
    {
        PartnerAuditLog::create([
            'partner_id' => $partner->id,
            'user_id' => $user->id,
            'action' => $action,
            'details' => $details,
            'ip_address' => $request->ip(),
        ]);
    }
}
