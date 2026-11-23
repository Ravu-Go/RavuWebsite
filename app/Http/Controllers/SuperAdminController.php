<?php

namespace App\Http\Controllers;

use App\Models\Partner;
use App\Models\PartnerApplication;
use App\Models\PartnerAuditLog;
use App\Models\SiteContent;
use App\Models\SiteContentRevision;
use App\Models\SiteMedia;
use App\Services\SiteContentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminController extends Controller
{
    public function __construct(private readonly SiteContentService $content) {}

    public function index(Request $request): Response
    {
        $records = SiteContent::query()
            ->with(['publisher:id,name', 'draftEditor:id,name'])
            ->get()
            ->keyBy('key');

        $pages = collect($this->content->pages())->map(function (array $page, string $key) use ($records) {
            $record = $records->get($key);

            return [
                'key' => $key,
                'label' => $page['label'],
                'path' => $page['path'],
                'has_draft' => $record?->draft !== null,
                'published_at' => $record?->published_at?->toIso8601String(),
                'published_by' => $record?->publisher?->name,
                'draft_updated_at' => $record?->draft_updated_at?->toIso8601String(),
                'draft_updated_by' => $record?->draftEditor?->name,
                'is_customised' => $record?->published !== null,
            ];
        })->values();

        $documents = collect($this->content->pages())->keys()->mapWithKeys(fn (string $key) => [
            $key => [
                'draft' => $this->content->draft($key),
                'published' => $this->content->published($key),
            ],
        ]);

        $revisions = SiteContentRevision::query()
            ->with(['siteContent:id,key', 'publisher:id,name'])
            ->latest('id')
            ->limit(40)
            ->get()
            ->map(fn (SiteContentRevision $revision) => [
                'id' => $revision->id,
                'key' => $revision->siteContent?->key,
                'published_by' => $revision->publisher?->name ?? 'RAVU',
                'created_at' => $revision->created_at?->toIso8601String(),
            ]);

        return Inertia::render('Website/SuperAdminDashboard', [
            'pages' => $pages,
            'documents' => $documents,
            'revisions' => $revisions,
            'media' => SiteMedia::query()->latest('id')->limit(200)->get()->map(fn (SiteMedia $media) => [
                'id' => $media->id,
                'url' => $media->url,
                'name' => $media->original_name,
                'size' => $media->size,
                'created_at' => $media->created_at?->toIso8601String(),
            ]),
            'partnerSummary' => $this->partnerSummary(),
            'activity' => $this->activity(),
            'mediaMaxKb' => (int) config('site_content.media_max_kb', 5120),
        ]);
    }

    public function saveDraft(Request $request, string $key): RedirectResponse
    {
        $this->content->saveDraft($key, $request->input('content'), $request->user());

        return back()->with('success', 'Draft saved. Preview it, then publish when ready.');
    }

    public function publish(Request $request, string $key): RedirectResponse
    {
        if ($request->has('content')) {
            $this->content->saveDraft($key, $request->input('content'), $request->user());
        }
        $this->content->publish($key, $request->user());

        return back()->with('success', $this->content->pages()[$key]['label'].' is now live.');
    }

    public function discardDraft(string $key): RedirectResponse
    {
        $this->content->discardDraft($key);

        return back()->with('success', 'Unpublished changes discarded.');
    }

    public function restoreRevision(Request $request, string $key, SiteContentRevision $revision): RedirectResponse
    {
        $this->content->restoreRevision($key, $revision, $request->user());

        return back()->with('success', 'Earlier version loaded as a draft. Review it, then publish.');
    }

    public function startPreview(Request $request, string $key): RedirectResponse
    {
        $request->session()->put(SiteContentService::PREVIEW_SESSION_KEY, true);

        return redirect($this->content->pages()[$key]['path']);
    }

    public function stopPreview(Request $request): RedirectResponse
    {
        $request->session()->forget(SiteContentService::PREVIEW_SESSION_KEY);

        return redirect('/super-admin');
    }

    public function uploadMedia(Request $request): RedirectResponse
    {
        $maxKb = (int) config('site_content.media_max_kb', 5120);
        $request->validate([
            'file' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', "max:{$maxKb}"],
        ]);

        $file = $request->file('file');
        $disk = config('site_content.media_disk', 'public');
        $path = $file->storeAs(
            config('site_content.media_directory', 'site-media'),
            Str::uuid().'.'.$file->extension(),
            ['disk' => $disk, 'visibility' => 'public'],
        );

        SiteMedia::create([
            'disk' => $disk,
            'path' => $path,
            'url' => $this->publicUrl($disk, $path),
            'original_name' => Str::limit($file->getClientOriginalName(), 250, ''),
            'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
            'size' => $file->getSize(),
            'uploaded_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Image uploaded to the media library.');
    }

    public function deleteMedia(SiteMedia $media): RedirectResponse
    {
        Storage::disk($media->disk)->delete($media->path);
        $media->delete();

        return back()->with('success', 'Image removed from the media library.');
    }

    private function publicUrl(string $disk, string $path): string
    {
        $url = Storage::disk($disk)->url($path);

        // Local public disk: store a root-relative path so the URL survives domain changes.
        if ($disk === 'public') {
            return '/storage/'.ltrim($path, '/');
        }

        return $url;
    }

    private function partnerSummary(): array
    {
        $counts = PartnerApplication::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $recent = PartnerApplication::query()
            ->with(['partner.category', 'partner.users'])
            ->whereIn('status', ['submitted', 'under_review', 'action_required'])
            ->orderByRaw("case status when 'submitted' then 0 when 'under_review' then 1 else 2 end")
            ->orderByDesc('submitted_at')
            ->limit(12)
            ->get()
            ->map(function (PartnerApplication $application) {
                $partner = $application->partner;
                $owner = $partner?->users->firstWhere('pivot.role', 'owner') ?? $partner?->users->first();

                return [
                    'id' => $application->id,
                    'status' => $application->status,
                    'version' => $application->version,
                    'submitted_at' => $application->submitted_at?->toIso8601String(),
                    'business' => $partner?->trading_name ?: $partner?->registered_name ?: 'Unnamed business',
                    'category' => $partner?->category?->name,
                    'contact' => $owner?->name,
                    'contact_email' => $owner?->email,
                ];
            });

        return [
            'counts' => [
                'draft' => (int) ($counts['draft'] ?? 0),
                'submitted' => (int) ($counts['submitted'] ?? 0),
                'under_review' => (int) ($counts['under_review'] ?? 0),
                'action_required' => (int) ($counts['action_required'] ?? 0),
                'approved' => (int) ($counts['approved'] ?? 0),
                'rejected' => (int) ($counts['rejected'] ?? 0),
                'suspended' => (int) ($counts['suspended'] ?? 0),
            ],
            'active_partners' => Partner::where('status', 'active')->count(),
            'queue' => $recent,
        ];
    }

    private function activity(): array
    {
        return PartnerAuditLog::query()
            ->with(['user:id,name', 'partner:id,trading_name,registered_name'])
            ->latest('id')
            ->limit(15)
            ->get()
            ->map(fn (PartnerAuditLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'details' => $log->details,
                'user' => $log->user?->name ?? 'System',
                'partner' => $log->partner?->trading_name ?: $log->partner?->registered_name,
                'created_at' => $log->created_at?->toIso8601String(),
            ])
            ->all();
    }
}
