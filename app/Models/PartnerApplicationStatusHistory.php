<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartnerApplicationStatusHistory extends Model
{
    protected $table = 'partner_application_status_history';

    protected $fillable = ['partner_application_id', 'previous_status', 'new_status', 'changed_by', 'comment'];

    public function application(): BelongsTo
    {
        return $this->belongsTo(PartnerApplication::class, 'partner_application_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
