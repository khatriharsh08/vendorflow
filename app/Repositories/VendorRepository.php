<?php

namespace App\Repositories;

use App\Interfaces\VendorRepositoryInterface;
use App\Models\Vendor;
use App\Models\VendorDocument;

class VendorRepository implements VendorRepositoryInterface
{
    public function findByUserId(int $userId): ?Vendor
    {
        return Vendor::where('user_id', $userId)->first();
    }

    public function updateOrCreate(array $attributes, array $values): Vendor
    {
        return Vendor::updateOrCreate($attributes, $values);
    }

    public function deleteDocuments(Vendor $vendor): void
    {
        $vendor->documents()->delete();
    }

    public function createDocument(Vendor $vendor, array $data)
    {
        return VendorDocument::create(array_merge([
            'vendor_id' => $vendor->id,
        ], $data));
    }
}
