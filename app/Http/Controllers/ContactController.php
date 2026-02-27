<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Http\Requests\Admin\UpdateContactMessageRequest;
use App\Http\Requests\StoreContactMessageRequest;
use App\Models\ContactMessage;
use App\Services\ContactMessageService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function __construct(protected ContactMessageService $contactMessageService) {}

    /**
     * Store a new contact message
     */
    public function store(StoreContactMessageRequest $request)
    {
        $this->contactMessageService->create($request->validated());

        return back()->with('success', 'Thank you for your message! We\'ll get back to you soon.');
    }

    /**
     * Display all contact messages (Admin only)
     */
    public function index(Request $request)
    {
        $data = $this->contactMessageService->indexData($request);

        return Inertia::render('Admin/ContactMessages/Index', [
            'messages' => $data['messages'],
            'filters' => $data['filters'],
            'stats' => $data['stats'],
        ]);
    }

    /**
     * Show a single message
     */
    public function show(ContactMessage $contactMessage)
    {
        $message = $this->contactMessageService->markAsReadIfNew($contactMessage);

        return Inertia::render('Admin/ContactMessages/Show', [
            'message' => $message,
        ]);
    }

    /**
     * Update message status
     */
    public function update(UpdateContactMessageRequest $request, ContactMessage $contactMessage)
    {
        $this->contactMessageService->update($contactMessage, $request->validated());

        return back()->with('success', 'Message updated successfully.');
    }

    /**
     * Delete a message
     */
    public function destroy(ContactMessage $contactMessage)
    {
        AuditLog::log(
            AuditLog::EVENT_DELETED,
            $contactMessage,
            [
                'status' => $contactMessage->status,
                'email' => $contactMessage->email,
            ],
            null,
            'Contact message soft-deleted by staff'
        );

        $contactMessage->delete();

        return redirect()->route('admin.contact-messages.index')
            ->with('success', 'Message deleted successfully.');
    }
}
