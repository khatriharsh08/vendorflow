<?php

namespace App\Http\Requests\Vendor;

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
        return [
            'company_name' => 'required|string|max:255',
            'registration_number' => 'nullable|string|max:50',
            'tax_id' => 'nullable|string|max:50',
            'pan_number' => 'required|string|max:20',
            'business_type' => 'nullable|string|max:50',
            'contact_person' => 'required|string|max:255',
            'contact_phone' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'state' => 'nullable|string|max:100',
            'pincode' => 'required|string|max:20',
            'bank_name' => 'nullable|string|max:100',
            'bank_account_number' => 'nullable|string|max:30',
            'bank_ifsc' => 'nullable|string|max:20',
            'bank_branch' => 'nullable|string|max:100',
        ];
    }
}
