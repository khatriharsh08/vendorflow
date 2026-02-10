<?php

namespace App\Repositories;

use App\Interfaces\PaymentRepositoryInterface;
use App\Models\PaymentApproval;
use App\Models\PaymentRequest;

class PaymentRepository implements PaymentRepositoryInterface
{
    public function createRequest(array $data): PaymentRequest
    {
        return PaymentRequest::create($data);
    }

    public function updateRequest(PaymentRequest $request, array $data): bool
    {
        return $request->update($data);
    }

    public function findRequestById(int $id): ?PaymentRequest
    {
        return PaymentRequest::find($id);
    }

    public function createApproval(array $data): PaymentApproval
    {
        return PaymentApproval::create($data);
    }

    public function updateOrCreateApproval(array $attributes, array $values): PaymentApproval
    {
        return PaymentApproval::updateOrCreate($attributes, $values);
    }

    public function existsRecentDuplicate(int $vendorId, float $amount, ?string $invoiceNumber): bool
    {
        return PaymentRequest::where('vendor_id', $vendorId)
            ->where('created_at', '>=', now()->subDays(30))
            ->where(function ($query) use ($amount, $invoiceNumber) {
                $query->where('amount', $amount);
                if ($invoiceNumber) {
                    $query->orWhere('invoice_number', $invoiceNumber);
                }
            })
            ->whereNotIn('status', [
                PaymentRequest::STATUS_REJECTED,
                PaymentRequest::STATUS_CANCELLED,
            ])
            ->exists();
    }
}
