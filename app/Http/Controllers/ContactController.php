<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\UpdateContactMessageRequest;
use App\Http\Requests\StoreContactMessageRequest;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
{
    /**
     * Store a new contact message
     */
    public function store(StoreContactMessageRequest $request)
    {
        $validated = $request->validated();

        ContactMessage::create($validated);

        return back()->with('success', 'Thank you for your message! We\'ll get back to you soon.');
    }

    /**
     * Display all contact messages (Admin only)
     */
    public function index(Request $request)
    {
        $query = ContactMessage::query()->latest();

        // Filter by status
        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        $messages = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/ContactMessages/Index', [
            'messages' => $messages,
            'filters' => $request->only(['status', 'search']),
            'stats' => [
                'total' => ContactMessage::count(),
                'new' => ContactMessage::where('status', 'new')->count(),
                'read' => ContactMessage::where('status', 'read')->count(),
                'replied' => ContactMessage::where('status', 'replied')->count(),
            ],
        ]);
    }

    /**
     * Show a single message
     */
    public function show(ContactMessage $contactMessage)
    {
        // Mark as read if new
        if ($contactMessage->status === 'new') {
            $contactMessage->update(['status' => 'read']);
        }

        return Inertia::render('Admin/ContactMessages/Show', [
            'message' => $contactMessage,
        ]);
    }

    /**
     * Update message status
     */
    public function update(UpdateContactMessageRequest $request, ContactMessage $contactMessage)
    {
        $validated = $request->validated();

        $contactMessage->update($validated);

        return back()->with('success', 'Message updated successfully.');
    }

    /**
     * Delete a message
     */
    public function destroy(ContactMessage $contactMessage)
    {
        $contactMessage->delete();

        return redirect()->route('admin.contact-messages.index')
            ->with('success', 'Message deleted successfully.');
    }
}
