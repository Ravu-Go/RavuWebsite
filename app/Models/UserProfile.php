<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Website-only account details for a user (see the create_user_profiles migration). */
class UserProfile extends Model
{
    public const FIELDS = [
        'position', 'preferred_communication',
        'terms_accepted_at', 'privacy_accepted_at', 'terms_version', 'privacy_version',
        'google_id', 'avatar', 'password_change_required',
        'last_login_at', 'last_login_provider', 'last_login_ip',
    ];

    protected $guarded = ['id'];

    protected $hidden = ['google_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return [
            'terms_accepted_at' => 'datetime',
            'privacy_accepted_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password_change_required' => 'boolean',
        ];
    }
}
