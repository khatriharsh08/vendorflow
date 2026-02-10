<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UploadDocumentRequest extends FormRequest
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
            'document_type_id' => 'required|exists:document_types,id',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'expiry_date' => 'nullable|date',
        ];
    }
}
