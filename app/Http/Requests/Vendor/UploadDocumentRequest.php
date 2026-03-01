<?php

namespace App\Http\Requests\Vendor;

use App\Models\DocumentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Validator;

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
            'document_type_id' => 'required|exists:document_types,id,is_active,1',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'expiry_date' => 'nullable|date|after_or_equal:today',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $documentTypeId = (int) $this->input('document_type_id');
            $documentType = DocumentType::query()->find($documentTypeId);

            if (! $documentType) {
                return;
            }

            $expiryDate = $this->input('expiry_date');

            if ($documentType->has_expiry && blank($expiryDate)) {
                $validator->errors()->add(
                    'expiry_date',
                    "Expiry date is required for {$documentType->display_name}."
                );
            }
        });
    }
}
