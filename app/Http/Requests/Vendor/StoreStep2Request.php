<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;

class StoreStep2Request extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'bank_name' => 'required|string|max:255',
            'bank_account_number' => 'required|string|max:50',
            'bank_ifsc' => 'required|string|max:20',
            'bank_branch' => 'nullable|string|max:255',
        ];
    }
}
