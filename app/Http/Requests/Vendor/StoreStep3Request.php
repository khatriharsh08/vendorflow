<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;

class StoreStep3Request extends FormRequest
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
            'documents' => 'required|array',
            'documents.*.document_type_id' => 'required|exists:document_types,id',
            'documents.*.file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB max, restricted types
        ];
    }
}
