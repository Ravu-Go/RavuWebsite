<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Reads the portal-wide activity log: filtering, paging, and plain-English descriptions.
 */
class ActivityLogService
{
    public const PERIODS = ['today' => 0, '7d' => 7, '30d' => 30, '90d' => 90, 'all' => null];

    public const PER_PAGE = 40;

    public function __construct(private readonly SiteContentService $content) {}

    /** Filters from the query string, normalised. */
    public function filters(Request $request): array
    {
        $category = (string) $request->query('category', '');
        $period = (string) $request->query('period', '30d');

        $action = (string) $request->query('action', '');

        return [
            'q' => Str::limit(trim((string) $request->query('q', '')), 100, ''),
            'category' => in_array($category, ActivityLog::CATEGORIES, true) ? $category : '',
            'action' => preg_match('/^[a-z_]{1,60}$/', $action) ? $action : '',
            'user' => ctype_digit((string) $request->query('user', '')) ? (int) $request->query('user') : null,
            'period' => array_key_exists($period, self::PERIODS) ? $period : '30d',
        ];
    }

    /** Person and period only: the scope the summary counts use. */
    private function scoped(array $filters): Builder
    {
        $query = ActivityLog::query();
        if ($filters['user']) {
            $query->where('user_id', $filters['user']);
        }
        $days = self::PERIODS[$filters['period']];
        if ($days !== null) {
            $query->where('created_at', '>=', $days === 0 ? now()->startOfDay() : now()->subDays($days));
        }

        return $query;
    }

    public function query(array $filters): Builder
    {
        $query = $this->scoped($filters)->with(['user:id,name,email', 'partner:id,trading_name,registered_name']);

        if ($filters['category']) {
            $query->where('category', $filters['category']);
        }
        if ($filters['action'] ?? '') {
            $query->where('action', $filters['action']);
        }
        if ($filters['q'] !== '') {
            $term = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $filters['q']).'%';
            $query->where(function (Builder $q) use ($term) {
                $q->where('action', 'like', $term)
                    ->orWhere('ip_address', 'like', $term)
                    ->orWhere('details', 'like', $term)
                    ->orWhereHas('user', fn (Builder $u) => $u->where('name', 'like', $term)->orWhere('email', 'like', $term))
                    ->orWhereHas('partner', fn (Builder $p) => $p->where('trading_name', 'like', $term)->orWhere('registered_name', 'like', $term));
            });
        }

        // Newest first by time; backfilled history was not inserted in time order.
        return $query->orderByDesc('created_at')->orderByDesc('id');
    }

    /** One page of the log for the Super Admin "Activity log" section. */
    public function page(Request $request): array
    {
        $filters = $this->filters($request);
        $page = $this->query($filters)->paginate(self::PER_PAGE, ['*'], 'p')->withQueryString();

        return [
            'filters' => $filters,
            'entries' => collect($page->items())->map(fn (ActivityLog $log) => $this->present($log))->all(),
            'summary' => $this->summary($filters),
            'pagination' => [
                'current' => $page->currentPage(),
                'last' => $page->lastPage(),
                'from' => $page->firstItem(),
                'to' => $page->lastItem(),
                'total' => $page->total(),
            ],
            // People who appear in the log, for the "Person" filter.
            'people' => User::query()
                ->whereIn('id', ActivityLog::query()->whereNotNull('user_id')->distinct()->select('user_id'))
                ->orderBy('name')
                ->get(['id', 'name', 'email'])
                ->map(fn (User $user) => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email])
                ->all(),
        ];
    }

    /**
     * Headline counts for the chosen person and period, plus failed sign-ins grouped by account.
     */
    public function summary(array $filters): array
    {
        $counts = $this->scoped($filters)
            ->whereIn('action', ['signed_in', 'sign_in_failed', 'sign_in_locked_out', 'sign_in_denied', 'signed_out', 'access_denied'])
            ->selectRaw('action, count(*) as total')
            ->groupBy('action')
            ->pluck('total', 'action');

        $failures = $this->scoped($filters)
            ->whereIn('action', ['sign_in_failed', 'sign_in_locked_out', 'sign_in_denied'])
            ->latest('created_at')
            ->limit(2000)
            ->get(['action', 'details', 'ip_address', 'created_at'])
            ->groupBy(fn (ActivityLog $log) => $log->details['email'] ?? 'unknown')
            ->map(fn ($group, $email) => [
                'email' => $email,
                'failed' => $group->where('action', 'sign_in_failed')->count(),
                'locked' => $group->where('action', 'sign_in_locked_out')->count(),
                'denied' => $group->where('action', 'sign_in_denied')->count(),
                'ips' => $group->pluck('ip_address')->filter()->unique()->count(),
                'last_at' => $group->max('created_at')?->toIso8601String(),
            ])
            ->sortByDesc(fn ($row) => $row['failed'] + $row['locked'] + $row['denied'])
            ->take(6)
            ->values()
            ->all();

        return [
            'total' => $this->scoped($filters)->count(),
            'signed_in' => (int) ($counts['signed_in'] ?? 0),
            'sign_in_failed' => (int) ($counts['sign_in_failed'] ?? 0),
            'sign_in_locked_out' => (int) ($counts['sign_in_locked_out'] ?? 0),
            'sign_in_denied' => (int) ($counts['sign_in_denied'] ?? 0),
            'signed_out' => (int) ($counts['signed_out'] ?? 0),
            'access_denied' => (int) ($counts['access_denied'] ?? 0),
            'unique_ips' => $this->scoped($filters)->whereNotNull('ip_address')->distinct()->count('ip_address'),
            'failures_by_account' => $failures,
        ];
    }

    /** The most recent entries, for the overview's activity card. */
    public function recent(int $limit = 8): array
    {
        return ActivityLog::query()
            ->with(['user:id,name,email', 'partner:id,trading_name,registered_name'])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit($limit)
            ->get()
            ->map(fn (ActivityLog $log) => $this->present($log))
            ->all();
    }

    public function present(ActivityLog $log): array
    {
        return [
            'id' => $log->id,
            'category' => $log->category,
            'action' => $log->action,
            'description' => $this->describe($log),
            'user' => $log->user ? ['id' => $log->user->id, 'name' => $log->user->name, 'email' => $log->user->email] : null,
            'partner' => $this->partnerName($log),
            'details' => $this->detailRows($log),
            'ip_address' => $log->ip_address,
            'user_agent' => $log->user_agent,
            'created_at' => $log->created_at?->toIso8601String(),
        ];
    }

    public function describe(ActivityLog $log): string
    {
        $d = $log->details ?? [];
        $partner = $this->partnerName($log) ?? 'A partner';
        $page = isset($d['page']) ? ($this->content->pages()[$d['page']]['label'] ?? $d['page']) : 'a page';
        $status = fn (?string $value) => $value ? Str::of($value)->replace('_', ' ')->lower()->toString() : 'unknown';

        return match ($log->action) {
            // Partner portal & review
            'account_registered' => "{$partner} registered for the partner portal",
            'application_status_changed' => "{$partner}: application moved from {$status($d['from'] ?? null)} to {$status($d['to'] ?? null)}",
            'business_profile_saved' => "{$partner} updated their business details",
            'primary_location_saved' => "{$partner} updated their business location",
            'benefit_proposal_saved' => "{$partner} updated their proposed member benefit",
            'document_uploaded' => "{$partner} uploaded ".($d['filename'] ?? 'a document'),
            'document_reviewed' => "Document for {$partner} marked {$status($d['status'] ?? null)}",
            'benefit_reviewed' => "Member benefit for {$partner} marked {$status($d['status'] ?? null)}",
            // Website content
            'content_draft_saved' => "Saved a draft of {$page}",
            'content_published' => "Published {$page}",
            'content_draft_discarded' => "Discarded unpublished changes to {$page}",
            'content_revision_restored' => "Loaded an earlier version of {$page} into the draft",
            // Media
            'media_uploaded' => 'Uploaded image '.($d['name'] ?? ''),
            'media_deleted' => 'Deleted image '.($d['name'] ?? ''),
            // Partner settings
            'category_created' => 'Added business category '.($d['name'] ?? ''),
            'category_updated' => 'Updated business category '.($d['name'] ?? ''),
            'requirement_created' => 'Added document requirement '.($d['label'] ?? ''),
            'requirement_updated' => 'Updated document requirement '.($d['label'] ?? ''),
            // Accounts & sign-in
            'account_updated' => 'Updated their account details',
            'password_changed' => 'Changed their password',
            'password_reset' => 'Reset their password from an email link',
            'signed_in' => match ($d['method'] ?? null) {
                'google' => 'Signed in with Google',
                'new account' => 'Signed in after creating an account',
                'remembered session' => 'Signed in automatically (remembered device)',
                default => 'Signed in',
            },
            'signed_out' => 'Signed out',
            'sign_in_failed' => (($d['method'] ?? null) === 'google' ? 'Failed Google sign-in' : 'Failed sign-in attempt')
                .(isset($d['email']) && $d['email'] !== '' ? " for {$d['email']}" : '')
                .(isset($d['attempt']) && $d['attempt'] > 1 ? " (attempt {$d['attempt']})" : ''),
            'sign_in_locked_out' => 'Too many attempts — sign-in locked for '.($d['email'] ?? 'an account').(isset($d['retry_after']) ? " ({$d['retry_after']}s)" : ''),
            'sign_in_denied' => 'Sign-in refused: '.($d['email'] ?? 'account').' has no portal access',
            'registration_rate_limited' => 'Registration blocked: too many sign-ups from one network',
            'password_reset_requested' => 'Password reset link requested for '.($d['email'] ?? 'an account'),
            'email_verified' => 'Verified their email address',
            'verification_email_sent' => 'Requested a new verification email',
            // Data access
            'application_viewed' => "Opened {$partner}'s application",
            'document_downloaded' => 'Downloaded '.($d['filename'] ?? 'a document').($this->partnerName($log) ? " ({$partner})" : ''),
            'activity_exported' => 'Exported the activity log',
            'access_denied' => 'Blocked from '.($d['area'] ?? 'a restricted page').(isset($d['path']) ? " ({$d['path']})" : ''),
            'partner_contact_updated' => "{$partner} updated their contact details",
            // Member redemptions & payouts
            'redemption_recorded' => "{$partner} served member ".($d['member_ref'] ?? '').(isset($d['paid']) ? ' (TSh '.number_format((int) $d['paid']).')' : ''),
            'redemption_voided' => "{$partner} voided receipt ".($d['receipt_no'] ?? '').(isset($d['reason']) ? ": {$d['reason']}" : ''),
            'payouts_approved' => 'Approved partner payouts for '.($d['period'] ?? 'a month').(isset($d['pool']) ? ' (pool TSh '.number_format((int) $d['pool']).')' : ''),
            'payout_paid' => 'Marked a partner payout for '.($d['period'] ?? 'a month').' as paid'.(isset($d['reference']) ? " (ref {$d['reference']})" : ''),
            // Membership plans
            'plan_created' => 'Created membership plan '.($d['name'] ?? '').' (draft)',
            'plan_updated' => 'Edited membership plan '.($d['name'] ?? ''),
            'plan_price_changed' => 'Changed the price of '.($d['name'] ?? 'a plan').(isset($d['from'], $d['to']) ? ' from TSh '.number_format((int) $d['from']).' to TSh '.number_format((int) $d['to']) : ''),
            'plan_published' => 'Published membership plan '.($d['name'] ?? ''),
            'plan_retired' => 'Retired membership plan '.($d['name'] ?? '').' (closed to new members)',
            'plan_reactivated' => 'Reopened membership plan '.($d['name'] ?? ''),
            'plan_deleted' => 'Deleted draft plan '.($d['name'] ?? ''),
            'plans_reordered' => 'Reordered membership plans',
            // Mobile app
            'mobile_versions_updated' => 'Changed the app version rules',
            'mobile_maintenance_enabled' => 'Turned ON app maintenance mode',
            'mobile_maintenance_disabled' => 'Turned OFF app maintenance mode',
            'mobile_maintenance_updated' => 'Updated the app maintenance message',
            'mobile_support_updated' => 'Updated app support details and links',
            'mobile_announcement_created' => 'Created app announcement “'.($d['title'] ?? '').'”',
            'mobile_announcement_updated' => 'Updated app announcement “'.($d['title'] ?? '').'”',
            'mobile_announcement_deleted' => 'Deleted app announcement “'.($d['title'] ?? '').'”',
            'mobile_feature_created' => 'Added app feature switch '.($d['name'] ?? ''),
            'mobile_feature_updated' => 'Updated app feature switch '.($d['name'] ?? ''),
            'mobile_feature_enabled' => 'Turned ON app feature '.($d['name'] ?? ''),
            'mobile_feature_disabled' => 'Turned OFF app feature '.($d['name'] ?? ''),
            'mobile_feature_deleted' => 'Removed app feature switch '.($d['name'] ?? ''),
            default => Str::of($log->action)->replace('_', ' ')->ucfirst()->toString(),
        };
    }

    /** Details as label/value rows for the expandable view (never raw internals). */
    private function detailRows(ActivityLog $log): array
    {
        $labels = [
            'from' => 'From', 'to' => 'To', 'status' => 'Status', 'comment' => 'Comment', 'page' => 'Page',
            'filename' => 'File', 'document_type' => 'Document type', 'name' => 'Name', 'label' => 'Label',
            'size' => 'Size', 'method' => 'Method', 'email' => 'Email', 'changed' => 'Changed',
            'previous_email' => 'Previous email', 'revision' => 'Version',
            'attempt' => 'Attempt number', 'retry_after' => 'Locked for (seconds)', 'reason' => 'Reason',
            'remember' => 'Remember me', 'outcome' => 'Outcome', 'path' => 'Page', 'area' => 'Area',
            'existing' => 'Existing members', 'interval' => 'Billing', 'direction' => 'Moved', 'price' => 'Price',
            'filters' => 'Filters', 'until' => 'Until', 'key' => 'Key', 'title' => 'Title',
            'ios_min' => 'iOS minimum', 'ios_latest' => 'iOS latest', 'android_min' => 'Android minimum', 'android_latest' => 'Android latest',
        ];

        return collect($log->details ?? [])
            ->filter(fn ($value) => $value !== null && $value !== '' && $value !== [])
            ->map(fn ($value, $key) => [
                'label' => $labels[$key] ?? Str::of($key)->replace('_', ' ')->ucfirst()->toString(),
                'value' => match (true) {
                    $key === 'size' && is_numeric($value) => round($value / 1024).' KB',
                    $key === 'page' => $this->content->pages()[$value]['label'] ?? $value,
                    is_array($value) => implode(', ', array_map('strval', $value)),
                    default => Str::of((string) $value)->replace('_', ' ')->toString(),
                },
            ])
            ->values()
            ->all();
    }

    private function partnerName(ActivityLog $log): ?string
    {
        return $log->partner?->trading_name ?: $log->partner?->registered_name;
    }
}
