<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * A sign-in account. With RAVU_APP_SHARED_ACCOUNTS on, this is the RAVU app's own
 * users table; the website's extra details (UserProfile::FIELDS) are read and written
 * like ordinary attributes but stored in user_profiles, so the app's table is untouched.
 */
#[Fillable(['name', 'email', 'password', 'role', 'google_id', 'avatar', 'last_login_at', 'last_login_provider', 'last_login_ip', 'position', 'phone', 'preferred_communication', 'terms_accepted_at', 'privacy_accepted_at', 'terms_version', 'privacy_version'])]
#[Hidden(['password', 'remember_token', 'google_id', 'mfa_secret'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;
    use MustVerifyEmailTrait;

    protected static function booted(): void
    {
        // Persist profile fields set on the user (create, fill, forceFill) after the user row.
        static::saved(function (User $user) {
            $profile = $user->relationLoaded('profile') ? $user->getRelation('profile') : null;
            if ($profile && $profile->isDirty()) {
                $profile->user_id = $user->getKey();
                $profile->save();
            }
        });
    }

    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    /** The loaded (or a new, unsaved) profile record. */
    public function profileRecord(): UserProfile
    {
        $profile = $this->relationLoaded('profile') ? $this->getRelation('profile') : null;

        if (! $profile) {
            $profile = ($this->exists ? $this->profile()->first() : null) ?? new UserProfile;
            $this->setRelation('profile', $profile);
        }

        return $profile;
    }

    public function getAttribute($key)
    {
        if (in_array($key, UserProfile::FIELDS, true)) {
            return $this->profileRecord()->getAttribute($key);
        }

        return parent::getAttribute($key);
    }

    public function setAttribute($key, $value)
    {
        if (in_array($key, UserProfile::FIELDS, true)) {
            $this->profileRecord()->setAttribute($key, $value);

            return $this;
        }

        return parent::setAttribute($key, $value);
    }

    /** Users whose website portal role is one of the given roles. */
    public function scopeWithPortalRole(Builder $query, array $roles): Builder
    {
        $appRoles = $roles;
        if (in_array('super_admin', $roles, true)) {
            $appRoles = array_merge($appRoles, (array) config('ravu_app.super_admin_roles', []));
        }

        return $query->whereIn('role', array_values(array_unique($appRoles)));
    }

    /**
     * Check if the user has super admin privileges.
     */
    public function isSuperAdmin(): bool
    {
        return $this->portalRole() === 'super_admin';
    }

    /**
     * Resolve the web portal role for this user. RAVU app administrators
     * (config ravu_app.super_admin_roles) are website super admins.
     */
    public function portalRole(): string
    {
        $role = (string) ($this->role ?? 'member');

        if ($role === 'super_admin' || in_array($role, (array) config('ravu_app.super_admin_roles', []), true)) {
            return 'super_admin';
        }

        if ($role === config('ravu_app.partner_role', 'partner')) {
            return 'partner';
        }

        return $role ?: 'member';
    }

    /** Whether the RAVU app still allows this account to sign in. */
    public function isActiveAccount(): bool
    {
        $status = $this->getAttributeFromArray('status');
        $closedAt = $this->getAttributeFromArray('closed_at');

        return ($status === null || $status === 'active') && $closedAt === null;
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
            'password' => 'hashed',
        ];
    }
}
