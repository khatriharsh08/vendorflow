<?php

namespace App\Http\Requests\Vendor;

use App\Models\Vendor;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check() && Auth::user()->isVendor();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        $vendor = $user?->vendor;

        if ($vendor && $vendor->status !== Vendor::STATUS_DRAFT) {
            // After submission, contact + bank fields are editable (not company details).
            return [
                'contact_person' => 'required|string|max:255',
                'contact_phone' => ['required', 'string', 'regex:/^[0-9]{10}$/'],
                'address' => 'required|string|max:500',
                'city' => 'required|string|max:100',
                'state' => 'required|string|max:100',
                'pincode' => ['required', 'string', 'regex:/^[0-9]{6}$/'],
                'bank_name' => 'required|string|max:255',
                'bank_account_number' => ['required', 'string', 'regex:/^[0-9]{9,18}$/'],
                'bank_ifsc' => ['required', 'string', 'regex:/^[A-Z]{4}0[A-Z0-9]{6}$/'],
                'bank_branch' => 'required|string|max:255',
            ];
        }

        return [
            'company_name' => 'required|string|max:255',
            'registration_number' => 'nullable|string|max:50',
            'tax_id' => 'nullable|string|max:50',
            'pan_number' => 'required|string|max:20',
            'business_type' => 'nullable|string|max:50',
            'contact_person' => 'required|string|max:255',
            'contact_phone' => ['required', 'string', 'regex:/^[0-9]{10}$/'],
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'pincode' => ['required', 'string', 'regex:/^[0-9]{6}$/'],
            'bank_name' => 'required|string|max:255',
            'bank_account_number' => ['required', 'string', 'regex:/^[0-9]{9,18}$/'],
            'bank_ifsc' => ['required', 'string', 'regex:/^[A-Z]{4}0[A-Z0-9]{6}$/'],
            'bank_branch' => 'required|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'contact_phone.regex' => 'Phone number must be exactly 10 digits.',
            'pincode.regex' => 'Pincode must be exactly 6 digits.',
            'bank_account_number.regex' => 'Account number must be 9 to 18 digits.',
            'bank_ifsc.regex' => 'IFSC must be in format SBIN0001234 (4 letters, 0, 6 alphanumeric).',
        ];
    }
}
