<?php

namespace App\Interfaces;

use App\Models\Vendor;

interface VendorRepositoryInterface
{
    public function findByUserId(int $userId): ?Vendor;

    public function updateOrCreate(array $attributes, array $values): Vendor;

    public function deleteDocuments(Vendor $vendor): void;

    public function createDocument(Vendor $vendor, array $data);
}
