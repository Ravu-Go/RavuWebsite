<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartnerLocation extends Model
{
    protected $fillable = ['partner_id', 'name', 'country', 'region', 'district', 'ward', 'physical_address', 'business_phone', 'operating_hours', 'latitude', 'longitude', 'is_primary', 'status'];

    protected function casts(): array
    {
        return ['operating_hours' => 'array', 'is_primary' => 'boolean', 'latitude' => 'decimal:7', 'longitude' => 'decimal:7'];
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }
}
