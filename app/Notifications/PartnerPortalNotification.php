<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PartnerPortalNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $subject,
        public string $message,
        public string $url = '/partner-dashboard',
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject($this->subject)
            ->greeting('Hello '.($notifiable->name ?? 'there').',')
            ->line($this->message)
            ->action('Open RAVU Partner Portal', url($this->url))
            ->salutation('RAVU Partner Team');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'subject' => $this->subject,
            'message' => $this->message,
            'url' => $this->url,
        ];
    }
}
