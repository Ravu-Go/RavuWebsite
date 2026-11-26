<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * Portal-wide activity log.
 *
 * Categories: partner, content, media, settings, account, auth (sign-ins & security), access (data access).
 */
class ActivityLog extends Model
{
    public const CATEGORIES = ['partner', 'content', 'media', 'settings', 'account', 'auth', 'access', 'mobile', 'membership'];

    protected $fillable = ['user_id', 'partner_id', 'category', 'action', 'subject_type', 'subject_id', 'details', 'ip_address', 'user_agent'];

    protected function casts(): array
    {
        return ['details' => 'array'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    /**
     * Record an event for the current request. The actor defaults to the signed-in user.
     */
    public static function record(string $category, string $action, array $details = [], ?Model $subject = null, ?User $user = null, ?int $partnerId = null): self
    {
        $request = request();

        return self::create([
            'user_id' => $user?->id ?? $request?->user()?->id,
            'partner_id' => $partnerId,
            'category' => $category,
            'action' => $action,
            'subject_type' => $subject ? $subject::class : null,
            'subject_id' => $subject?->getKey(),
            'details' => array_filter($details, fn ($value) => $value !== null && $value !== ''),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent() ? Str::limit($request->userAgent(), 250, '') : null,
        ]);
    }
}
