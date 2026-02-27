<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Pagination\LengthAwarePaginator;

class UserNotificationService
{
    /**
     * @return array{notifications: LengthAwarePaginator, unreadCount: int}
     */
    public function indexData(User $user): array
    {
        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return [
            'notifications' => $notifications,
            'unreadCount' => $this->unreadCount($user),
        ];
    }

    public function markAsRead(User $user, string $id): void
    {
        /** @var DatabaseNotification|null $notification */
        $notification = $user->notifications()
            ->where('id', $id)
            ->first();

        if ($notification && $notification->read_at === null) {
            $notification->markAsRead();
        }
    }

    public function markAllAsRead(User $user): void
    {
        $user->unreadNotifications->markAsRead();
    }

    public function unreadCount(User $user): int
    {
        return $user->unreadNotifications()->count();
    }
}
