<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreStep1Request extends FormRequest
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
            'registration_number' => [
                'required',
                'string',
                'max:21',
                'regex:/^([UL][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}|[A-Z]{3}-[0-9]{4})$/',
            ],
            'tax_id' => [
                'required',
                'string',
                'size:15',
                'regex:/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/',
            ],
            'pan_number' => ['required', 'string', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]$/'],
            'business_type' => 'required|string|max:50',
            'contact_person' => 'required|string|max:255',
            'contact_phone' => ['required', 'string', 'regex:/^[0-9]{10}$/'],
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'pincode' => ['required', 'string', 'regex:/^[0-9]{6}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'registration_number.required' => 'Registration Number (CIN / LLPIN) is required.',
            'registration_number.regex' => 'Enter a valid CIN (e.g. U12345MH2020PTC123456) or LLPIN (e.g. AAA-1234).',
            'tax_id.required' => 'GST Number is required.',
            'tax_id.size' => 'GST Number must be exactly 15 characters.',
            'tax_id.regex' => 'Enter a valid GSTIN (e.g. 22AAAAA0000A1Z5).',
            'pan_number.regex' => 'PAN must be in the format ABCDE1234F (5 letters, 4 digits, 1 letter).',
            'contact_phone.regex' => 'Phone number must be exactly 10 digits.',
            'pincode.regex' => 'Pincode must be exactly 6 digits.',
        ];
    }
}
