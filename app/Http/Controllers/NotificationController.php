<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\UserNotificationService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function __construct(protected UserNotificationService $notificationService) {}

    /**
     * Show notification center.
     */
    public function index()
    {
        /** @var User $user */
        $user = Auth::user();
        $data = $this->notificationService->indexData($user);

        return Inertia::render('Notifications/Index', [
            'notifications' => $data['notifications'],
            'unreadCount' => $data['unreadCount'],
        ]);
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(string $id)
    {
        /** @var User $user */
        $user = Auth::user();
        $this->notificationService->markAsRead($user, $id);

        return back();
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead()
    {
        /** @var User $user */
        $user = Auth::user();
        $this->notificationService->markAllAsRead($user);

        return back()->with('success', 'All notifications marked as read.');
    }

    /**
     * Get unread notifications count (for header).
     */
    public function getUnreadCount()
    {
        /** @var User $user */
        $user = Auth::user();

        return response()->json([
            'count' => $this->notificationService->unreadCount($user),
        ]);
    }
}
