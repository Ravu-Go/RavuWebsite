<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartnerDocument extends Model
{
    protected $fillable = ['partner_id', 'partner_application_id', 'document_requirement_id', 'uploaded_by', 'reviewed_by', 'replaces_document_id', 'document_type', 'original_filename', 'storage_path', 'mime_type', 'file_size', 'expires_at', 'status', 'review_comments', 'verified_at', 'superseded_at'];

    protected function casts(): array
    {
        return ['expires_at' => 'date', 'verified_at' => 'datetime', 'superseded_at' => 'datetime'];
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(PartnerApplication::class, 'partner_application_id');
    }

    public function requirement(): BelongsTo
    {
        return $this->belongsTo(DocumentRequirement::class, 'document_requirement_id');
    }
}
