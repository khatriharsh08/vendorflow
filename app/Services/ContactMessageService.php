<?php

namespace App\Services;

use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class ContactMessageService
{
    public function create(array $data): ContactMessage
    {
        return ContactMessage::create($data);
    }

    /**
     * @return array{messages: LengthAwarePaginator, filters: array<string, string|null>, stats: array<string, int>}
     */
    public function indexData(Request $request): array
    {
        $query = ContactMessage::query()->latest();

        $status = $request->query('status');
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $search = $request->query('search');
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        $messages = $query->paginate(15)->withQueryString();

        return [
            'messages' => $messages,
            'filters' => $request->only(['status', 'search']),
            'stats' => [
                'total' => ContactMessage::count(),
                'new' => ContactMessage::where('status', ContactMessage::STATUS_NEW)->count(),
                'read' => ContactMessage::where('status', ContactMessage::STATUS_READ)->count(),
                'replied' => ContactMessage::where('status', ContactMessage::STATUS_REPLIED)->count(),
            ],
        ];
    }

    public function markAsReadIfNew(ContactMessage $contactMessage): ContactMessage
    {
        if ($contactMessage->status === ContactMessage::STATUS_NEW) {
            $contactMessage->update(['status' => ContactMessage::STATUS_READ]);
        }

        return $contactMessage->refresh();
    }

    public function update(ContactMessage $contactMessage, array $data): ContactMessage
    {
        $contactMessage->update($data);

        return $contactMessage->refresh();
    }
}
