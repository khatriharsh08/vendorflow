<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;

class VendorFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Vendor::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'company_name' => $this->faker->company(),
            'registration_number' => $this->faker->numerify('REG-#####'),
            'tax_id' => $this->faker->numerify('TAX-#####'),
            'pan_number' => $this->faker->bothify('?????####?'),
            'business_type' => $this->faker->randomElement(['proprietorship', 'partnership', 'private_limited']),
            'contact_person' => $this->faker->name(),
            'contact_email' => $this->faker->companyEmail(),
            'contact_phone' => $this->faker->phoneNumber(),
            'address' => $this->faker->address(),
            'city' => $this->faker->city(),
            'state' => $this->faker->state(),
            'country' => $this->faker->country(),
            'pincode' => $this->faker->postcode(),
            'bank_name' => $this->faker->company() . ' Bank',
            'bank_account_number' => $this->faker->bankAccountNumber(),
            'bank_ifsc' => $this->faker->bothify('????0######'),
            'status' => Vendor::STATUS_DRAFT,
            'compliance_status' => Vendor::COMPLIANCE_PENDING,
            'compliance_score' => $this->faker->numberBetween(0, 100),
            'performance_score' => $this->faker->numberBetween(0, 100),
        ];
    }
}
