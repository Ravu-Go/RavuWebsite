<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'role', 'google_id', 'avatar', 'last_login_at', 'last_login_provider', 'last_login_ip', 'position', 'phone', 'preferred_communication', 'terms_accepted_at', 'privacy_accepted_at', 'terms_version', 'privacy_version'])]
#[Hidden(['password', 'remember_token', 'google_id'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;
    use MustVerifyEmailTrait;

    /**
     * Check if the user has super admin privileges.
     */
    public function isSuperAdmin(): bool
    {
        return ($this->role ?? null) === 'super_admin';
    }

    /**
     * Resolve the web portal role for this user.
     */
    public function portalRole(): string
    {
        return $this->isSuperAdmin() ? 'super_admin' : ($this->role ?? 'member');
    }

    public function isPartnerReviewer(): bool
    {
        return $this->isSuperAdmin() || $this->role === 'partner_reviewer';
    }

    public function partners(): BelongsToMany
    {
        return $this->belongsToMany(Partner::class)->withPivot('role')->withTimestamps();
    }

    public function isPartnerUser(): bool
    {
        return $this->portalRole() === 'partner' && $this->partners()->exists();
    }

    public function primaryPartner(): ?Partner
    {
        return $this->partners()->with(['application.statusHistory.actor', 'category', 'locations', 'documents.requirement', 'benefits.location'])->first();
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'terms_accepted_at' => 'datetime',
            'privacy_accepted_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
