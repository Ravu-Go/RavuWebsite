<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\MobileAnnouncement;
use App\Models\MobileFeature;
use App\Services\MobileAppConfigService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Super Admin controls for the RAVU mobile app. Every change is written to the activity log.
 */
class MobileAppController extends Controller
{
    private const VERSION = ['nullable', 'string', 'max:20', 'regex:'.MobileAppConfigService::VERSION_PATTERN];

    private const LINK = ['nullable', 'string', 'max:500', 'regex:/^(https?:\/\/|ravu:\/\/|\/)\S*$/'];

    public function __construct(private readonly MobileAppConfigService $config) {}

    public function updateVersions(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'versions.ios.min' => self::VERSION,
            'versions.ios.latest' => self::VERSION,
            'versions.android.min' => self::VERSION,
            'versions.android.latest' => self::VERSION,
            'update_message' => ['required', 'string', 'max:280'],
        ], ['regex' => 'Use a version number like 1.4 or 1.4.2.']);

        foreach (MobileAppConfigService::PLATFORMS as $platform) {
            $min = $data['versions'][$platform]['min'] ?? null;
            $latest = $data['versions'][$platform]['latest'] ?? null;
            if ($min && $latest && version_compare($min, $latest, '>')) {
                throw ValidationException::withMessages(["versions.{$platform}.min" => 'The minimum version cannot be newer than the latest version.']);
            }
        }

        $before = $this->config->settings()['versions'];
        $versions = collect(MobileAppConfigService::PLATFORMS)->mapWithKeys(fn ($p) => [$p => [
            'min' => $data['versions'][$p]['min'] ?? null,
            'latest' => $data['versions'][$p]['latest'] ?? null,
        ]])->all();
        $this->config->save(['versions' => $versions, 'update_message' => trim($data['update_message'])], $request->user());

        ActivityLog::record('mobile', 'mobile_versions_updated', collect(MobileAppConfigService::PLATFORMS)->flatMap(fn ($p) => [
            "{$p}_min" => $this->change($before[$p]['min'] ?? null, $versions[$p]['min']),
            "{$p}_latest" => $this->change($before[$p]['latest'] ?? null, $versions[$p]['latest']),
        ])->filter()->all());

        return back()->with('success', 'App version rules saved. The app picks them up on next launch.');
    }

    public function updateMaintenance(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'enabled' => ['required', 'boolean'],
            'message' => ['required', 'string', 'max:280'],
            // Only a maintenance window being switched on must end in the future.
            'until' => ['nullable', 'date', Rule::when($request->boolean('enabled'), 'after:now')],
        ]);

        $wasOn = (bool) $this->config->settings()['maintenance']['enabled'];
        $this->config->save(['maintenance' => [
            'enabled' => (bool) $data['enabled'],
            'message' => trim($data['message']),
            'until' => $data['until'] ? now()->parse($data['until'])->toIso8601String() : null,
        ]], $request->user());

        $action = match (true) {
            $data['enabled'] && ! $wasOn => 'mobile_maintenance_enabled',
            ! $data['enabled'] && $wasOn => 'mobile_maintenance_disabled',
            default => 'mobile_maintenance_updated',
        };
        ActivityLog::record('mobile', $action, ['message' => $data['message'], 'until' => $data['until'] ?? null]);

        return back()->with('success', $data['enabled'] ? 'Maintenance mode is ON. App users now see the maintenance screen.' : 'Maintenance settings saved.');
    }

    public function updateSupport(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'support.phone' => ['nullable', 'string', 'max:30'],
            'support.whatsapp' => ['nullable', 'string', 'max:30'],
            'support.email' => ['nullable', 'email', 'max:120'],
            'support.hours' => ['nullable', 'string', 'max:80'],
            'links.terms' => self::LINK,
            'links.privacy' => self::LINK,
            'links.help' => self::LINK,
        ], ['regex' => 'Use a full https:// link, a ravu:// app link, or a /page path.']);

        $this->config->save([
            'support' => array_map(fn ($v) => trim((string) $v), $data['support'] ?? []),
            'links' => array_map(fn ($v) => trim((string) $v), $data['links'] ?? []),
        ], $request->user());
        ActivityLog::record('mobile', 'mobile_support_updated');

        return back()->with('success', 'Support details and links saved.');
    }

    public function storeAnnouncement(Request $request): RedirectResponse
    {
        $announcement = MobileAnnouncement::create($this->announcementData($request) + ['created_by' => $request->user()->id]);
        ActivityLog::record('mobile', 'mobile_announcement_created', ['title' => $announcement->title, 'status' => $announcement->state()], $announcement);

        return back()->with('success', 'Announcement saved.');
    }

    public function updateAnnouncement(Request $request, MobileAnnouncement $announcement): RedirectResponse
    {
        $announcement->update($this->announcementData($request));
        ActivityLog::record('mobile', 'mobile_announcement_updated', ['title' => $announcement->title, 'status' => $announcement->state()], $announcement);

        return back()->with('success', 'Announcement updated.');
    }

    public function destroyAnnouncement(MobileAnnouncement $announcement): RedirectResponse
    {
        $announcement->delete();
        ActivityLog::record('mobile', 'mobile_announcement_deleted', ['title' => $announcement->title], $announcement);

        return back()->with('success', 'Announcement deleted.');
    }

    public function storeFeature(Request $request): RedirectResponse
    {
        $feature = MobileFeature::create($this->featureData($request) + ['updated_by' => $request->user()->id]);
        ActivityLog::record('mobile', 'mobile_feature_created', ['name' => $feature->name, 'key' => $feature->key, 'status' => $feature->enabled ? 'on' : 'off'], $feature);

        return back()->with('success', 'Feature switch added.');
    }

    public function updateFeature(Request $request, MobileFeature $feature): RedirectResponse
    {
        $feature->fill($this->featureData($request, $feature) + ['updated_by' => $request->user()->id]);
        $onlyToggled = array_diff(array_keys($feature->getDirty()), ['enabled', 'updated_by']) === [];
        $toggled = $feature->isDirty('enabled');
        $feature->save();

        ActivityLog::record('mobile', $toggled && $onlyToggled ? ($feature->enabled ? 'mobile_feature_enabled' : 'mobile_feature_disabled') : 'mobile_feature_updated', [
            'name' => $feature->name,
            'key' => $feature->key,
            'status' => $feature->enabled ? 'on' : 'off',
        ], $feature);

        return back()->with('success', $toggled && $onlyToggled ? "{$feature->name} is now ".($feature->enabled ? 'ON' : 'OFF').' in the app.' : 'Feature switch updated.');
    }

    public function destroyFeature(MobileFeature $feature): RedirectResponse
    {
        $feature->delete();
        ActivityLog::record('mobile', 'mobile_feature_deleted', ['name' => $feature->name, 'key' => $feature->key], $feature);

        return back()->with('success', 'Feature switch removed.');
    }

    private function announcementData(Request $request): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:80'],
            'body' => ['required', 'string', 'max:280'],
            'tone' => ['required', Rule::in(MobileAnnouncement::TONES)],
            'audience' => ['required', Rule::in(MobileAnnouncement::AUDIENCES)],
            'cta_label' => ['nullable', 'string', 'max:30', 'required_with:cta_url'],
            'cta_url' => [...self::LINK, 'required_with:cta_label'],
            'min_app_version' => self::VERSION,
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'is_active' => ['required', 'boolean'],
            'dismissible' => ['required', 'boolean'],
        ], ['cta_url.regex' => 'Use a full https:// link, a ravu:// app link, or a /page path.', 'min_app_version.regex' => 'Use a version number like 1.4 or 1.4.2.']);

        return [...$data, 'title' => trim($data['title']), 'body' => trim($data['body']), 'updated_by' => $request->user()->id];
    }

    private function featureData(Request $request, ?MobileFeature $feature = null): array
    {
        return $request->validate([
            'key' => ['required', 'string', 'regex:/^[a-z][a-z0-9_]{1,49}$/', Rule::unique('mobile_features', 'key')->ignore($feature?->id)],
            'name' => ['required', 'string', 'max:80'],
            'description' => ['nullable', 'string', 'max:280'],
            'enabled' => ['required', 'boolean'],
            'platforms' => ['required', Rule::in(MobileFeature::PLATFORMS)],
            'min_app_version' => self::VERSION,
        ], ['key.regex' => 'Use lowercase letters, numbers and underscores, starting with a letter (e.g. fleet_dashboard).', 'min_app_version.regex' => 'Use a version number like 1.4 or 1.4.2.']);
    }

    private function change(?string $from, ?string $to): ?string
    {
        return $from === $to ? null : ($from ?: 'none').' → '.($to ?: 'none');
    }
}
