<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use App\Services\ContactMessageService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class ContactMessageServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_data_applies_filters_and_returns_stats(): void
    {
        ContactMessage::create([
            'name' => 'Alice',
            'email' => 'alice@example.com',
            'subject' => 'Vendor issue',
            'message' => 'Need help',
            'status' => ContactMessage::STATUS_NEW,
        ]);

        ContactMessage::create([
            'name' => 'Bob',
            'email' => 'bob@example.com',
            'subject' => 'Payment follow up',
            'message' => 'Where is payment',
            'status' => ContactMessage::STATUS_READ,
        ]);

        ContactMessage::create([
            'name' => 'Charlie',
            'email' => 'charlie@example.com',
            'subject' => 'Vendor onboarding',
            'message' => 'Submitted docs',
            'status' => ContactMessage::STATUS_REPLIED,
        ]);

        $request = Request::create('/admin/contact-messages', 'GET', [
            'status' => 'new',
            'search' => 'Vendor',
        ]);

        /** @var ContactMessageService $service */
        $service = app(ContactMessageService::class);
        $data = $service->indexData($request);

        $this->assertSame(3, $data['stats']['total']);
        $this->assertSame(1, $data['stats']['new']);
        $this->assertSame(1, $data['stats']['read']);
        $this->assertSame(1, $data['stats']['replied']);
        $this->assertCount(1, $data['messages']->items());
        $this->assertSame('Alice', $data['messages']->items()[0]->name);
    }

    public function test_mark_as_read_if_new_transitions_status(): void
    {
        $message = ContactMessage::create([
            'name' => 'Diana',
            'email' => 'diana@example.com',
            'subject' => 'Test',
            'message' => 'Message',
            'status' => ContactMessage::STATUS_NEW,
        ]);

        /** @var ContactMessageService $service */
        $service = app(ContactMessageService::class);
        $updated = $service->markAsReadIfNew($message);

        $this->assertSame(ContactMessage::STATUS_READ, $updated->status);
        $this->assertDatabaseHas('contact_messages', [
            'id' => $message->id,
            'status' => ContactMessage::STATUS_READ,
        ]);
    }
}
