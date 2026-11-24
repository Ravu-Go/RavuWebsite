<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartnerAuditLog extends Model
{
    protected $fillable = ['partner_id', 'user_id', 'action', 'subject_type', 'subject_id', 'details', 'ip_address'];

    protected function casts(): array
    {
        return ['details' => 'array'];
    }

    /** Every partner event also lands in the portal-wide activity log. */
    protected static function booted(): void
    {
        static::created(function (self $log) {
            ActivityLog::create([
                'user_id' => $log->user_id,
                'partner_id' => $log->partner_id,
                'category' => 'partner',
                'action' => $log->action,
                'subject_type' => $log->subject_type,
                'subject_id' => $log->subject_id,
                'details' => $log->details,
                'ip_address' => $log->ip_address,
                'user_agent' => request()?->userAgent() ? substr(request()->userAgent(), 0, 250) : null,
            ]);
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }
}
