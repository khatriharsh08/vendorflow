<?php

namespace App\Http\Requests\Vendor;

use App\Models\DocumentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Validator;

class StoreStep3Request extends FormRequest
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
            'documents' => 'nullable|array',
            'documents.*.document_type_id' => 'required|exists:document_types,id',
            'documents.*.file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB max, restricted types
            'documents.*.expiry_date' => 'nullable|date|after_or_equal:today',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $documents = $this->input('documents', []);

            if (! is_array($documents) || empty($documents)) {
                return;
            }

            $documentTypeIds = collect($documents)
                ->pluck('document_type_id')
                ->filter()
                ->map(fn ($id) => (int) $id)
                ->unique()
                ->values()
                ->all();

            $types = DocumentType::query()
                ->whereIn('id', $documentTypeIds)
                ->get()
                ->keyBy('id');

            foreach ($documents as $index => $doc) {
                $typeId = (int) ($doc['document_type_id'] ?? 0);
                $type = $types->get($typeId);

                if (! $type) {
                    continue;
                }

                $expiryDate = $doc['expiry_date'] ?? null;

                if ($type->has_expiry && blank($expiryDate)) {
                    $validator->errors()->add(
                        "documents.{$index}.expiry_date",
                        "Expiry date is required for {$type->display_name}."
                    );
                }

                if (! $type->has_expiry && filled($expiryDate)) {
                    $validator->errors()->add(
                        "documents.{$index}.expiry_date",
                        "Expiry date is not allowed for {$type->display_name}."
                    );
                }
            }
        });
    }
}
