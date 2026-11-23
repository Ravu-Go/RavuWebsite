<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Partner extends Model
{
    protected $fillable = ['registered_name', 'trading_name', 'registration_number', 'tin_number', 'partner_category_id', 'business_description', 'year_established', 'website', 'social_links', 'status'];

    protected function casts(): array
    {
        return ['social_links' => 'array', 'year_established' => 'integer'];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(PartnerCategory::class, 'partner_category_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withPivot('role')->withTimestamps();
    }

    public function application(): HasOne
    {
        return $this->hasOne(PartnerApplication::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(PartnerDocument::class);
    }

    public function locations(): HasMany
    {
        return $this->hasMany(PartnerLocation::class);
    }

    public function benefits(): HasMany
    {
        return $this->hasMany(ProposedPartnerBenefit::class);
    }
}
