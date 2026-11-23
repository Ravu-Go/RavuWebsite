<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiteContentRevision extends Model
{
    protected $fillable = ['site_content_id', 'content', 'published_by'];

    protected function casts(): array
    {
        return ['content' => 'array'];
    }

    public function siteContent(): BelongsTo
    {
        return $this->belongsTo(SiteContent::class);
    }

    public function publisher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }
}
