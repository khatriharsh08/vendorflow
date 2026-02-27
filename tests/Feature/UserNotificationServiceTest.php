<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\UserNotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class UserNotificationServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_data_returns_notifications_and_unread_count(): void
    {
        $user = User::factory()->create();

        $this->insertNotification($user->id, null);
        $this->insertNotification($user->id, now());

        /** @var UserNotificationService $service */
        $service = app(UserNotificationService::class);
        $data = $service->indexData($user);

        $this->assertSame(2, $data['notifications']->total());
        $this->assertSame(1, $data['unreadCount']);
    }

    public function test_mark_as_read_marks_single_notification(): void
    {
        $user = User::factory()->create();
        $notificationId = $this->insertNotification($user->id, null);

        /** @var UserNotificationService $service */
        $service = app(UserNotificationService::class);
        $service->markAsRead($user, $notificationId);

        $this->assertDatabaseHas('notifications', [
            'id' => $notificationId,
            'notifiable_id' => $user->id,
        ]);
        $this->assertNotNull(DB::table('notifications')->where('id', $notificationId)->value('read_at'));
    }

    public function test_mark_all_as_read_marks_all_user_notifications(): void
    {
        $user = User::factory()->create();
        $this->insertNotification($user->id, null);
        $this->insertNotification($user->id, null);

        /** @var UserNotificationService $service */
        $service = app(UserNotificationService::class);
        $service->markAllAsRead($user);

        $this->assertSame(0, $service->unreadCount($user));
    }

    private function insertNotification(int $userId, $readAt): string
    {
        $id = (string) Str::uuid();

        DB::table('notifications')->insert([
            'id' => $id,
            'type' => 'App\\Notifications\\TestNotification',
            'notifiable_type' => User::class,
            'notifiable_id' => $userId,
            'data' => json_encode([
                'title' => 'Test',
                'message' => 'Test message',
                'type' => 'system',
                'severity' => 'info',
            ]),
            'read_at' => $readAt,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $id;
    }
}
