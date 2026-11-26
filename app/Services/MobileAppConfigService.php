<?php

namespace App\Services;

use App\Models\MobileAnnouncement;
use App\Models\MobileAppSetting;
use App\Models\MobileFeature;
use App\Models\User;

/**
 * Remote configuration for the RAVU mobile app.
 *
 * The admin edits it in the Super Admin "Mobile app" section; the app reads the
 * result from GET /api/mobile/config at launch. Everything in the payload is
 * public by design: never put secrets here.
 */
class MobileAppConfigService
{
    public const PLATFORMS = ['ios', 'android'];

    public const VERSION_PATTERN = '/^\d+(\.\d+){0,3}$/';

    private const TONE_ORDER = ['critical' => 0, 'warning' => 1, 'success' => 2, 'info' => 3];

    public function __construct(private readonly SiteContentService $content) {}

    public function defaults(): array
    {
        return [
            'versions' => [
                'ios' => ['min' => null, 'latest' => null],
                'android' => ['min' => null, 'latest' => null],
            ],
            'update_message' => 'A new version of RAVU is available with improvements and fixes.',
            'maintenance' => [
                'enabled' => false,
                'message' => "RAVU is undergoing scheduled maintenance. We'll be back shortly.",
                'until' => null,
            ],
            'support' => [
                'phone' => '',
                'whatsapp' => '',
                'email' => (string) ($this->content->published('global')['brand']['contactEmail'] ?? ''),
                'hours' => 'Mon–Sat, 8:00–20:00 EAT',
            ],
            'links' => [
                'terms' => (string) config('partner.terms_url', ''),
                'privacy' => (string) config('partner.privacy_url', ''),
                'help' => url('/support'),
            ],
        ];
    }

    public function record(): ?MobileAppSetting
    {
        return MobileAppSetting::query()->with('editor:id,name')->first();
    }

    public function settings(): array
    {
        return array_replace_recursive($this->defaults(), $this->record()?->data ?? []);
    }

    /** Replace one top-level part of the settings and bump the revision. */
    public function save(array $changes, User $user): MobileAppSetting
    {
        $record = $this->record() ?? new MobileAppSetting(['data' => [], 'revision' => 0]);
        $record->data = array_replace($this->settings(), $changes);
        $record->revision = ($record->revision ?? 0) + 1;
        $record->updated_by = $user->id;
        $record->save();

        return $record;
    }

    /** Store links come from the website's own App Store / Google Play settings. */
    public function storeUrls(): array
    {
        $links = $this->content->published('global')['appLinks'] ?? [];
        $clean = fn ($url) => is_string($url) && str_starts_with($url, 'http') ? $url : null;

        return ['ios' => $clean($links['appStoreUrl'] ?? null), 'android' => $clean($links['googlePlayUrl'] ?? null)];
    }

    /**
     * What the app receives. With a platform and version, update status,
     * announcements and features are resolved for that exact install.
     */
    public function payload(?string $platform = null, ?string $version = null): array
    {
        $platform = in_array($platform, self::PLATFORMS, true) ? $platform : null;
        $version = $version && preg_match(self::VERSION_PATTERN, $version) ? $version : null;
        $settings = $this->settings();
        $stores = $this->storeUrls();

        $maintenanceUntil = $settings['maintenance']['until'] ?? null;
        $maintenanceActive = (bool) $settings['maintenance']['enabled']
            && (! $maintenanceUntil || now()->lt($maintenanceUntil));

        return [
            'revision' => $this->record()?->revision ?? 0,
            'generated_at' => now()->toIso8601String(),
            'platform' => $platform,
            'app_version' => $version,
            'update' => $platform
                ? $this->updateFor($settings, $platform, $version, $stores[$platform])
                : collect(self::PLATFORMS)->mapWithKeys(fn ($p) => [$p => $this->updateFor($settings, $p, null, $stores[$p])])->all(),
            'maintenance' => [
                'active' => $maintenanceActive,
                'message' => $maintenanceActive ? $settings['maintenance']['message'] : null,
                'until' => $maintenanceActive ? $maintenanceUntil : null,
            ],
            'announcements' => $this->liveAnnouncements($platform, $version)->map(fn (MobileAnnouncement $a) => [
                'id' => $a->id,
                'title' => $a->title,
                'body' => $a->body,
                'tone' => $a->tone,
                'cta' => $a->cta_label && $a->cta_url ? ['label' => $a->cta_label, 'url' => $a->cta_url] : null,
                'dismissible' => $a->dismissible,
                'ends_at' => $a->ends_at?->toIso8601String(),
            ])->values()->all(),
            'features' => MobileFeature::query()->orderBy('key')->get()
                ->mapWithKeys(fn (MobileFeature $f) => [$f->key => $this->featureOn($f, $platform, $version)])
                ->all(),
            'support' => $settings['support'],
            'links' => $settings['links'],
        ];
    }

    /** Everything the admin section needs. */
    public function admin(): array
    {
        $record = $this->record();

        return [
            'settings' => $this->settings(),
            'revision' => $record?->revision ?? 0,
            'updated_at' => $record?->updated_at?->toIso8601String(),
            'updated_by' => $record?->editor?->name,
            'stores' => $this->storeUrls(),
            'endpoint' => url('/api/mobile/config'),
            'announcements' => MobileAnnouncement::query()->latest('id')->get()->map(fn (MobileAnnouncement $a) => [
                ...$a->only(['id', 'title', 'body', 'tone', 'audience', 'cta_label', 'cta_url', 'min_app_version', 'is_active', 'dismissible']),
                'starts_at' => $a->starts_at?->toIso8601String(),
                'ends_at' => $a->ends_at?->toIso8601String(),
                'state' => $a->state(),
            ])->all(),
            'features' => MobileFeature::query()->orderBy('name')->get()->map(fn (MobileFeature $f) => [
                ...$f->only(['id', 'key', 'name', 'description', 'enabled', 'platforms', 'min_app_version']),
                'updated_at' => $f->updated_at?->toIso8601String(),
            ])->all(),
        ];
    }

    private function updateFor(array $settings, string $platform, ?string $version, ?string $storeUrl): array
    {
        $min = $settings['versions'][$platform]['min'] ?? null;
        $latest = $settings['versions'][$platform]['latest'] ?? null;

        $status = match (true) {
            $version === null => 'unknown',
            $min && version_compare($version, $min, '<') => 'required',
            $latest && version_compare($version, $latest, '<') => 'recommended',
            default => 'ok',
        };

        return [
            'status' => $status,
            'min_version' => $min,
            'latest_version' => $latest,
            'message' => in_array($status, ['required', 'recommended'], true) ? $settings['update_message'] : null,
            'store_url' => $storeUrl,
        ];
    }

    private function liveAnnouncements(?string $platform, ?string $version)
    {
        return MobileAnnouncement::query()
            ->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>', now()))
            ->when($platform, fn ($q) => $q->whereIn('audience', ['all', $platform]))
            ->get()
            ->filter(fn (MobileAnnouncement $a) => ! $a->min_app_version || ($version && version_compare($version, $a->min_app_version, '>=')))
            ->sortBy([fn ($a, $b) => self::TONE_ORDER[$a->tone] <=> self::TONE_ORDER[$b->tone], fn ($a, $b) => $b->id <=> $a->id]);
    }

    private function featureOn(MobileFeature $feature, ?string $platform, ?string $version): bool
    {
        if (! $feature->enabled) {
            return false;
        }
        if ($feature->platforms !== 'all' && $platform !== null && $feature->platforms !== $platform) {
            return false;
        }
        if ($feature->platforms !== 'all' && $platform === null) {
            return false;
        }

        return ! $feature->min_app_version || ($version !== null && version_compare($version, $feature->min_app_version, '>='));
    }
}
