<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PartnerApplication extends Model
{
    protected $fillable = ['partner_id', 'status', 'version', 'resubmission_allowed', 'submitted_snapshot', 'submitted_at', 'reviewed_by', 'approved_at'];

    protected function casts(): array
    {
        return ['resubmission_allowed' => 'boolean', 'submitted_snapshot' => 'array', 'submitted_at' => 'datetime', 'approved_at' => 'datetime'];
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(PartnerApplicationStatusHistory::class)->latest();
    }

    public function documents(): HasMany
    {
        return $this->hasMany(PartnerDocument::class);
    }

    public function benefits(): HasMany
    {
        return $this->hasMany(ProposedPartnerBenefit::class);
    }
}
