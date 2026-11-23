<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SiteContent extends Model
{
    protected $fillable = ['key', 'draft', 'published', 'published_at', 'published_by', 'draft_updated_at', 'draft_updated_by'];

    protected function casts(): array
    {
        return [
            'draft' => 'array',
            'published' => 'array',
            'published_at' => 'datetime',
            'draft_updated_at' => 'datetime',
        ];
    }

    public function publisher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }

    public function draftEditor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'draft_updated_by');
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(SiteContentRevision::class)->latest('id');
    }
}
