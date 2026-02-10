<?php

namespace App\Interfaces;

use App\Models\PaymentApproval;
use App\Models\PaymentRequest;

interface PaymentRepositoryInterface
{
    public function createRequest(array $data): PaymentRequest;

    public function updateRequest(PaymentRequest $request, array $data): bool;

    public function findRequestById(int $id): ?PaymentRequest;

    public function createApproval(array $data): PaymentApproval;

    public function updateOrCreateApproval(array $attributes, array $values): PaymentApproval;

    public function existsRecentDuplicate(int $vendorId, float $amount, ?string $invoiceNumber): bool;
}
