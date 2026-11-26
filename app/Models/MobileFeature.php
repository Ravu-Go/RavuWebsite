<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** A remote on/off switch the app checks before showing a feature. */
class MobileFeature extends Model
{
    public const PLATFORMS = ['all', 'ios', 'android'];

    protected $fillable = ['key', 'name', 'description', 'enabled', 'platforms', 'min_app_version', 'updated_by'];

    protected function casts(): array
    {
        return ['enabled' => 'boolean'];
    }
}
