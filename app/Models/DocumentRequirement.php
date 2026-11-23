<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentRequirement extends Model
{
    protected $fillable = ['partner_category_id', 'document_type', 'label', 'description', 'is_required', 'requires_expiry_date', 'is_active', 'sort_order'];

    protected function casts(): array
    {
        return ['is_required' => 'boolean', 'requires_expiry_date' => 'boolean', 'is_active' => 'boolean'];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(PartnerCategory::class, 'partner_category_id');
    }
}
