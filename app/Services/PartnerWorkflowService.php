<?php

namespace App\Services;

use App\Models\PartnerApplication;
use App\Models\PartnerApplicationStatusHistory;
use App\Models\PartnerAuditLog;
use App\Models\User;
use App\Notifications\PartnerPortalNotification;
use Illuminate\Http\Request;

class PartnerWorkflowService
{
    public function transition(
        PartnerApplication $application,
        string $status,
        ?User $actor,
        ?string $comment = null,
        ?Request $request = null,
    ): void {
        $previous = $application->status;
        $application->forceFill(['status' => $status])->save();

        $partnerStatus = match ($status) {
            'approved' => 'active',
            'suspended' => 'suspended',
            'rejected' => 'rejected',
            'submitted', 'under_review', 'action_required' => 'pending_review',
            'expired' => 'expired',
            default => 'onboarding',
        };
        $application->partner()->update(['status' => $partnerStatus]);

        PartnerApplicationStatusHistory::create([
            'partner_application_id' => $application->id,
            'previous_status' => $previous,
            'new_status' => $status,
            'changed_by' => $actor?->id,
            'comment' => $comment,
        ]);

        PartnerAuditLog::create([
            'partner_id' => $application->partner_id,
            'user_id' => $actor?->id,
            'action' => 'application_status_changed',
            'subject_type' => PartnerApplication::class,
            'subject_id' => $application->id,
            'details' => ['from' => $previous, 'to' => $status, 'comment' => $comment],
            'ip_address' => $request?->ip(),
        ]);
    }

    public function notifyPartner(PartnerApplication $application, string $subject, string $message): void
    {
        $application->partner->users()->each(
            fn (User $user) => $user->notify(new PartnerPortalNotification($subject, $message)),
        );
    }

    public function notifyReviewers(PartnerApplication $application, string $subject, string $message): void
    {
        User::query()
            ->whereIn('role', ['super_admin', 'partner_reviewer'])
            ->each(fn (User $user) => $user->notify(new PartnerPortalNotification($subject, $message, '/partner-management')));
    }
}
