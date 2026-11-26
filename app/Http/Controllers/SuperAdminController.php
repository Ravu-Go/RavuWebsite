<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Partner;
use App\Models\PartnerApplication;
use App\Models\SiteContent;
use App\Models\SiteContentRevision;
use App\Models\SiteMedia;
use App\Services\ActivityLogService;
use App\Services\Membership\MembershipRevenueService;
use App\Services\MembershipPlanService;
use App\Services\MobileAppConfigService;
use App\Services\PartnerInsightsService;
use App\Services\PartnerPayoutService;
use App\Services\PartnerPerformanceService;
use App\Support\ReportPeriod;
use App\Services\SiteContentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminController extends Controller
{
    public function __construct(private readonly SiteContentService $content) {}

    public function index(Request $request): Response
    {
        $section = (string) $request->query('section', 'overview');
        $pageKeys = array_keys($this->content->pages());
        $editorKey = in_array($request->query('page'), $pageKeys, true) ? $request->query('page') : 'home';

        // Closures are only evaluated when a prop is actually sent, so a partial reload
        // (e.g. switching the page being edited) skips every other query.
        return Inertia::render('Website/SuperAdminDashboard', [
            'pages' => fn () => $this->pageSummaries(),
            // Only the draft being edited travels to the browser, never every page at once.
            'editor' => fn () => $section === 'content'
                ? ['key' => $editorKey, 'draft' => $this->content->draft($editorKey)]
                : null,
            'revisions' => fn () => $this->revisions(),
            'media' => fn () => SiteMedia::query()->latest('id')->limit(200)->get()->map(fn (SiteMedia $media) => [
                'id' => $media->id,
                'url' => $media->url,
                'name' => $media->original_name,
                'size' => $media->size,
                'created_at' => $media->created_at?->toIso8601String(),
            ]),
            'partnerSummary' => fn () => $this->partnerSummary(),
            'insights' => fn () => $section === 'insights'
                ? app(PartnerInsightsService::class)->build((string) $request->query('range', PartnerInsightsService::DEFAULT_RANGE))
                : null,
            'activity' => fn () => app(ActivityLogService::class)->recent(),
            'revenue' => fn () => $section === 'revenue'
                ? app(MembershipRevenueService::class)->build((string) $request->query('range', MembershipRevenueService::DEFAULT_RANGE))
                : null,
            'plans' => fn () => $section === 'plans' ? app(MembershipPlanService::class)->admin() : null,
            'partnerPerformance' => fn () => $section === 'partner-performance'
                ? app(PartnerPerformanceService::class)->leaderboard(ReportPeriod::parse($request->query('period')))
                : null,
            'payouts' => fn () => $section === 'payouts'
                ? app(PartnerPayoutService::class)->adminMonth($this->payoutMonth($request->query('period')))
                : null,
            'mobile' => fn () => $section === 'mobile' ? app(MobileAppConfigService::class)->admin() : null,
            'activityLog' => fn () => $section === 'activity' ? app(ActivityLogService::class)->page($request) : null,
            'mediaMaxKb' => (int) config('site_content.media_max_kb', 5120),
        ]);
    }

    /** Payouts are monthly; default to last month, the one most likely waiting for approval. */
    private function payoutMonth(?string $value): ReportPeriod
    {
        $period = $value ? ReportPeriod::parse($value) : null;
        if ($period && $period->type === 'month') {
            return $period;
        }
        $last = now()->subMonthNoOverflow();

        return ReportPeriod::month($last->year, $last->month);
    }

    private function pageSummaries(): array
    {
        $records = SiteContent::query()
            ->select(['id', 'key', 'published_at', 'published_by', 'draft_updated_at', 'draft_updated_by'])
            ->selectRaw('draft is not null as has_draft, published is not null as is_customised')
            ->with(['publisher:id,name', 'draftEditor:id,name'])
            ->get()
            ->keyBy('key');

        return collect($this->content->pages())->map(function (array $page, string $key) use ($records) {
            $record = $records->get($key);

            return [
                'key' => $key,
                'label' => $page['label'],
                'path' => $page['path'],
                'has_draft' => (bool) $record?->has_draft,
                'published_at' => $record?->published_at?->toIso8601String(),
                'published_by' => $record?->publisher?->name,
                'draft_updated_at' => $record?->draft_updated_at?->toIso8601String(),
                'draft_updated_by' => $record?->draftEditor?->name,
                'is_customised' => (bool) $record?->is_customised,
            ];
        })->values()->all();
    }

    private function revisions(): array
    {
        return SiteContentRevision::query()
            ->with(['siteContent:id,key', 'publisher:id,name'])
            ->latest('id')
            ->limit(40)
            ->get()
            ->map(fn (SiteContentRevision $revision) => [
                'id' => $revision->id,
                'key' => $revision->siteContent?->key,
                'published_by' => $revision->publisher?->name ?? 'RAVU',
                'created_at' => $revision->created_at?->toIso8601String(),
            ])
            ->all();
    }

    public function saveDraft(Request $request, string $key): RedirectResponse
    {
        $this->content->saveDraft($key, $request->input('content'), $request->user());
        ActivityLog::record('content', 'content_draft_saved', ['page' => $key]);

        return back()->with('success', 'Draft saved. Preview it, then publish when ready.');
    }

    public function publish(Request $request, string $key): RedirectResponse
    {
        if ($request->has('content')) {
            $this->content->saveDraft($key, $request->input('content'), $request->user());
        }
        $this->content->publish($key, $request->user());
        ActivityLog::record('content', 'content_published', ['page' => $key]);

        return back()->with('success', $this->content->pages()[$key]['label'].' is now live.');
    }

    public function discardDraft(string $key): RedirectResponse
    {
        $this->content->discardDraft($key);
        ActivityLog::record('content', 'content_draft_discarded', ['page' => $key]);

        return back()->with('success', 'Unpublished changes discarded.');
    }

    public function restoreRevision(Request $request, string $key, SiteContentRevision $revision): RedirectResponse
    {
        $this->content->restoreRevision($key, $revision, $request->user());
        ActivityLog::record('content', 'content_revision_restored', ['page' => $key, 'revision' => $revision->created_at?->toDayDateTimeString()], $revision);

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

        $media = SiteMedia::create([
            'disk' => $disk,
            'path' => $path,
            'url' => $this->publicUrl($disk, $path),
            'original_name' => Str::limit($file->getClientOriginalName(), 250, ''),
            'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
            'size' => $file->getSize(),
            'uploaded_by' => $request->user()->id,
        ]);
        ActivityLog::record('media', 'media_uploaded', ['name' => $media->original_name, 'size' => $media->size], $media);

        return back()->with('success', 'Image uploaded to the media library.');
    }

    public function deleteMedia(SiteMedia $media): RedirectResponse
    {
        Storage::disk($media->disk)->delete($media->path);
        $media->delete();
        ActivityLog::record('media', 'media_deleted', ['name' => $media->original_name], $media);

        return back()->with('success', 'Image removed from the media library.');
    }

    /** The filtered activity log as a CSV download. */
    public function exportActivity(Request $request, ActivityLogService $log): StreamedResponse
    {
        $filters = $log->filters($request);
        $query = $log->query($filters);
        ActivityLog::record('access', 'activity_exported', [
            'filters' => collect($filters)->filter()->map(fn ($v, $k) => "{$k}={$v}")->values()->all() ?: ['none'],
        ]);

        return response()->streamDownload(function () use ($query, $log) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Time', 'Category', 'Activity', 'Person', 'Email', 'Partner', 'IP address', 'Details']);
            $query->lazy(500)->each(function (ActivityLog $entry) use ($out, $log) {
                $row = $log->present($entry);
                fputcsv($out, [
                    $entry->created_at?->toDateTimeString(),
                    $entry->category,
                    $row['description'],
                    $row['user']['name'] ?? 'System',
                    $row['user']['email'] ?? '',
                    $row['partner'] ?? '',
                    $entry->ip_address,
                    collect($row['details'])->map(fn ($d) => "{$d['label']}: {$d['value']}")->implode('; '),
                ]);
            });
            fclose($out);
        }, 'ravu-activity-'.now()->format('Y-m-d-His').'.csv', ['Content-Type' => 'text/csv']);
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
}
