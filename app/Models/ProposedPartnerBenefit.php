<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProposedPartnerBenefit extends Model
{
    protected $fillable = ['partner_id', 'partner_application_id', 'partner_location_id', 'name', 'description', 'benefit_type', 'discount_percentage', 'discount_amount', 'currency', 'products_or_services', 'starts_at', 'expires_at', 'terms_and_conditions', 'redemption_instructions', 'status', 'reviewed_by', 'review_comments', 'approved_at'];

    protected function casts(): array
    {
        return ['discount_percentage' => 'decimal:2', 'discount_amount' => 'decimal:2', 'starts_at' => 'date', 'expires_at' => 'date', 'approved_at' => 'datetime'];
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(PartnerLocation::class, 'partner_location_id');
    }

    public function reviewHistory(): HasMany
    {
        return $this->hasMany(PartnerBenefitReviewHistory::class)->latest();
    }
}
