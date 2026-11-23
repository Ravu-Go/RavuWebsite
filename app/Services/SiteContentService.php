<?php

namespace App\Services;

use App\Models\SiteContent;
use App\Models\SiteContentRevision;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;
use Throwable;

/**
 * Website content: defaults live in resources/content/{key}.json, edits live
 * in site_contents as a draft plus the currently published version.
 *
 * Every stored document is "conformed" to the shape of its defaults file, so
 * the editor can only change values that the pages actually render — unknown
 * keys are dropped, types are enforced and links/media are validated.
 */
class SiteContentService
{
    public const PREVIEW_SESSION_KEY = 'site_content_preview';

    private const MAX_STRING = 5000;

    private const MAX_LIST_ITEMS = 60;

    /** @var array<string, array> */
    private array $defaultsCache = [];

    /** @return array<string, array{label:string, path:string}> */
    public function pages(): array
    {
        return config('site_content.pages', []);
    }

    public function exists(string $key): bool
    {
        return array_key_exists($key, $this->pages());
    }

    public function defaults(string $key): array
    {
        $this->assertKey($key);

        return $this->defaultsCache[$key] ??= json_decode(
            file_get_contents(resource_path("content/{$key}.json")),
            true,
            flags: JSON_THROW_ON_ERROR,
        );
    }

    /** Published content merged over the defaults (what visitors see). */
    public function published(string $key): array
    {
        $this->assertKey($key);

        $stored = Cache::rememberForever($this->cacheKey($key), function () use ($key) {
            return $this->record($key)?->published;
        });

        return $this->conform($stored, $this->defaults($key));
    }

    /** The working draft (falls back to published when there is no draft). */
    public function draft(string $key): array
    {
        $record = $this->record($key);

        return $this->conform($record?->draft ?? $record?->published, $this->defaults($key));
    }

    /** Content for the current request: drafts while a super admin is previewing. */
    public function forRequest(string $key, Request $request): array
    {
        return $this->previewing($request) ? $this->draft($key) : $this->published($key);
    }

    public function previewing(Request $request): bool
    {
        return $request->hasSession()
            && $request->session()->get(self::PREVIEW_SESSION_KEY) === true
            && $request->user()?->isSuperAdmin();
    }

    /**
     * Validate and store a draft.
     *
     * @throws ValidationException
     */
    public function saveDraft(string $key, mixed $content, User $user): SiteContent
    {
        $clean = $this->conform($content, $this->defaults($key), strict: true);

        $record = SiteContent::firstOrNew(['key' => $key]);
        $record->fill([
            'draft' => $clean,
            'draft_updated_at' => now(),
            'draft_updated_by' => $user->id,
        ])->save();

        return $record;
    }

    /** Publish the current draft and keep a revision of it. */
    public function publish(string $key, User $user): SiteContent
    {
        $this->assertKey($key);

        return DB::transaction(function () use ($key, $user) {
            $record = SiteContent::firstOrNew(['key' => $key]);
            if ($record->draft === null) {
                throw ValidationException::withMessages([
                    'content' => 'There are no unpublished changes for this page.',
                ]);
            }

            $record->fill([
                'published' => $record->draft,
                'draft' => null,
                'published_at' => now(),
                'published_by' => $user->id,
            ])->save();

            SiteContentRevision::create([
                'site_content_id' => $record->id,
                'content' => $record->published,
                'published_by' => $user->id,
            ]);

            Cache::forget($this->cacheKey($key));

            return $record;
        });
    }

    public function discardDraft(string $key): void
    {
        $this->assertKey($key);
        SiteContent::where('key', $key)->update(['draft' => null, 'draft_updated_at' => null, 'draft_updated_by' => null]);
    }

    /** Copy an earlier published version into the draft so it can be reviewed and republished. */
    public function restoreRevision(string $key, SiteContentRevision $revision, User $user): SiteContent
    {
        $record = $this->record($key);
        abort_unless($record && $revision->site_content_id === $record->id, 404);

        return $this->saveDraft($key, $revision->content, $user);
    }

    public function record(string $key): ?SiteContent
    {
        try {
            return SiteContent::where('key', $key)->first();
        } catch (Throwable $e) {
            // Before migrations run (fresh deploys, static builds) fall back to defaults.
            report($e);

            return null;
        }
    }

    /**
     * Shape $value like $default.
     *
     * Lenient mode (rendering) silently falls back to defaults on any mismatch.
     * Strict mode (saving) throws a validation error pointing at the field.
     */
    public function conform(mixed $value, mixed $default, bool $strict = false, string $path = 'content', string $field = ''): mixed
    {
        if (is_array($default) && ! array_is_list($default)) {
            if ($value === null) {
                return $default;
            }
            if (! is_array($value) || (array_is_list($value) && $value !== [])) {
                return $this->mismatch($strict, $path, 'must be a group of fields.', $default);
            }

            $result = [];
            foreach ($default as $key => $fallback) {
                $result[$key] = array_key_exists($key, $value)
                    ? $this->conform($value[$key], $fallback, $strict, "{$path}.{$key}", (string) $key)
                    : $fallback;
            }

            return $result;
        }

        if (is_array($default)) {
            if ($value === null) {
                return $default;
            }
            if (! is_array($value) || ! array_is_list($value)) {
                return $this->mismatch($strict, $path, 'must be a list.', $default);
            }
            if (count($value) > self::MAX_LIST_ITEMS) {
                return $this->mismatch($strict, $path, 'has too many items (max '.self::MAX_LIST_ITEMS.').', $default);
            }

            $template = $default[0] ?? '';

            return array_map(
                fn ($item, $index) => $this->conform($item, $template, $strict, "{$path}.{$index}", $field),
                $value,
                array_keys($value),
            );
        }

        if (is_string($default)) {
            if ($value === null) {
                return $strict ? '' : $default;
            }
            if (! is_string($value) && ! is_int($value) && ! is_float($value)) {
                return $this->mismatch($strict, $path, 'must be text.', $default);
            }
            $value = (string) $value;
            if (mb_strlen($value) > self::MAX_STRING) {
                return $this->mismatch($strict, $path, 'is too long (max '.self::MAX_STRING.' characters).', $default);
            }

            return $this->validateString($value, $field, $strict, $path, $default);
        }

        if (is_bool($default)) {
            return is_bool($value) ? $value : $this->mismatch($strict, $path, 'must be true or false.', $default);
        }

        if (is_int($default) || is_float($default)) {
            return is_numeric($value) ? $value + 0 : $this->mismatch($strict, $path, 'must be a number.', $default);
        }

        return $default;
    }

    private function validateString(string $value, string $field, bool $strict, string $path, string $default): string
    {
        $value = trim($value) === '' ? '' : $value;
        if ($value === '') {
            return $value;
        }

        if ($this->isLinkField($field)) {
            $ok = preg_match('#^(/(?!/)|\#|https?://|mailto:|tel:)#i', $value) === 1;

            return $ok ? $value : $this->mismatch($strict, $path, 'must be a site path (/page), #anchor, https:// link, mailto: or tel: link.', $default);
        }

        if ($field === 'image') {
            $ok = preg_match('#^[\w .,()\-]+\.(jpe?g|png|webp)$#i', $value) === 1
                || preg_match('#^/storage/[\w./\-]+$#', $value) === 1
                || (preg_match('#^https://#i', $value) === 1 && filter_var($value, FILTER_VALIDATE_URL));

            return $ok ? $value : $this->mismatch($strict, $path, 'must be an image from the media library.', $default);
        }

        if (Str::endsWith(Str::lower($field), 'email')) {
            return filter_var($value, FILTER_VALIDATE_EMAIL)
                ? $value
                : $this->mismatch($strict, $path, 'must be a valid email address.', $default);
        }

        return $value;
    }

    private function isLinkField(string $field): bool
    {
        $field = Str::lower($field);

        return $field === 'href' || $field === 'url' || Str::endsWith($field, ['href', 'url']);
    }

    private function mismatch(bool $strict, string $path, string $message, mixed $default): mixed
    {
        if ($strict) {
            throw ValidationException::withMessages([$path => $this->label($path).' '.$message]);
        }

        return $default;
    }

    private function label(string $path): string
    {
        $parts = array_slice(explode('.', $path), 1);
        $parts = array_map(fn ($part) => is_numeric($part) ? '#'.((int) $part + 1) : Str::headline($part), $parts);

        return $parts ? implode(' › ', $parts) : 'Content';
    }

    private function cacheKey(string $key): string
    {
        return "site_content:published:{$key}";
    }

    private function assertKey(string $key): void
    {
        if (! $this->exists($key)) {
            throw new InvalidArgumentException("Unknown site content key [{$key}].");
        }
    }
}
