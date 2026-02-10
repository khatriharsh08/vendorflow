<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StorePerformanceRatingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Add specific permission check if needed, e.g., $user->can('rate-vendors')
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'ratings' => 'required|array',
            'ratings.*.metric_id' => 'required|exists:performance_metrics,id',
            'ratings.*.score' => 'required|integer|min:0|max:10',
            'ratings.*.notes' => 'nullable|string|max:500',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
        ];
    }
}
