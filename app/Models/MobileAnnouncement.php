<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** A banner shown inside the mobile app, optionally scheduled and targeted. */
class MobileAnnouncement extends Model
{
    public const TONES = ['info', 'success', 'warning', 'critical'];

    public const AUDIENCES = ['all', 'ios', 'android'];

    protected $fillable = ['title', 'body', 'tone', 'audience', 'cta_label', 'cta_url', 'min_app_version', 'starts_at', 'ends_at', 'is_active', 'dismissible', 'created_by', 'updated_by'];

    protected function casts(): array
    {
        return ['starts_at' => 'datetime', 'ends_at' => 'datetime', 'is_active' => 'boolean', 'dismissible' => 'boolean'];
    }

    /** live, scheduled, ended or paused — as of now. */
    public function state(): string
    {
        if (! $this->is_active) {
            return 'paused';
        }
        if ($this->starts_at && $this->starts_at->isFuture()) {
            return 'scheduled';
        }
        if ($this->ends_at && $this->ends_at->isPast()) {
            return 'ended';
        }

        return 'live';
    }
}
