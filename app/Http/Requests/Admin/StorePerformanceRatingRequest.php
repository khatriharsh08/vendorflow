<?php

namespace App\Http\Requests\Admin;

use App\Models\PerformanceMetric;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Validator;

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
            'ratings' => 'required|array|min:1',
            'ratings.*.metric_id' => 'required|integer|distinct|exists:performance_metrics,id',
            'ratings.*.score' => 'required|integer|min:0',
            'ratings.*.notes' => 'nullable|string|max:500',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $ratings = collect($this->input('ratings', []));
            if ($ratings->isEmpty()) {
                return;
            }

            $metricIds = $ratings->pluck('metric_id')->filter()->unique()->values();
            if ($metricIds->isEmpty()) {
                return;
            }

            $metrics = PerformanceMetric::query()
                ->whereIn('id', $metricIds)
                ->pluck('max_score', 'id');

            foreach ($ratings as $index => $rating) {
                $metricId = (int) ($rating['metric_id'] ?? 0);
                $score = (int) ($rating['score'] ?? 0);
                $maxScore = (int) ($metrics[$metricId] ?? 0);

                if ($maxScore > 0 && $score > $maxScore) {
                    $validator->errors()->add(
                        "ratings.{$index}.score",
                        "Score cannot be greater than {$maxScore} for the selected metric."
                    );
                }
            }
        });
    }
}
