<?php

namespace Database\Seeders;

use App\Models\VendorState;
use Illuminate\Database\Seeder;

class VendorStateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $states = [
            ['name' => 'draft', 'display_name' => 'Draft', 'is_terminal' => false, 'sort_order' => 1],
            ['name' => 'submitted', 'display_name' => 'Submitted', 'is_terminal' => false, 'sort_order' => 2],
            ['name' => 'under_review', 'display_name' => 'Under Review', 'is_terminal' => false, 'sort_order' => 3],
            ['name' => 'approved', 'display_name' => 'Approved', 'is_terminal' => false, 'sort_order' => 4],
            ['name' => 'active', 'display_name' => 'Active', 'is_terminal' => false, 'sort_order' => 5],
            ['name' => 'suspended', 'display_name' => 'Suspended', 'is_terminal' => false, 'sort_order' => 6],
            ['name' => 'terminated', 'display_name' => 'Terminated', 'is_terminal' => true, 'sort_order' => 7],
            ['name' => 'rejected', 'display_name' => 'Rejected', 'is_terminal' => true, 'sort_order' => 8],
        ];

        foreach ($states as $state) {
            VendorState::updateOrCreate(
                ['name' => $state['name']],
                $state
            );
        }
    }
}
