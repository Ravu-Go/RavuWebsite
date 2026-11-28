<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** The single row of mobile app settings (versions, maintenance, support, links). */
class MobileAppSetting extends Model
{
    protected $fillable = ['data', 'revision', 'updated_by'];

    protected function casts(): array
    {
        return ['data' => 'array'];
    }

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
