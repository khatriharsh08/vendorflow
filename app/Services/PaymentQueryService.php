<?php

namespace App\Services;

use App\Models\PaymentRequest;
use Illuminate\Http\Request;

class PaymentQueryService
{
    /**
     * @return array<string, mixed>
     */
    public function adminIndexData(Request $request): array
    {
        $status = (string) $request->query('status', 'all');

        $query = PaymentRequest::with(['vendor', 'requester'])
            ->orderBy('created_at', 'desc');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $payments = $query->paginate(15);

        $stats = [
            'pending' => PaymentRequest::whereIn('status', [
                PaymentRequest::STATUS_REQUESTED,
                PaymentRequest::STATUS_PENDING_OPS,
                PaymentRequest::STATUS_PENDING_FINANCE,
            ])->count(),
            'approved' => PaymentRequest::where('status', PaymentRequest::STATUS_APPROVED)->count(),
            'paid' => (float) PaymentRequest::where('status', PaymentRequest::STATUS_PAID)->sum('amount'),
            'total' => PaymentRequest::count(),
        ];

        return [
            'payments' => $payments,
            'stats' => $stats,
            'currentStatus' => $status,
        ];
    }
}
