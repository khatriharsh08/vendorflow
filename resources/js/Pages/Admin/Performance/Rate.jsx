import { Link, useForm } from '@inertiajs/react';
import { AdminLayout, PageHeader, Card, Button } from '@/Components';

export default function RateVendor({ vendor, metrics = [] }) {
    const form = useForm({
        ratings: metrics.map((m) => ({ metric_id: m.id, score: 7, notes: '' })),
        period_start: new Date().toISOString().split('T')[0].slice(0, 7) + '-01',
        period_end: new Date().toISOString().split('T')[0],
    });

    const updateRating = (metricId, field, value) => {
        form.setData(
            'ratings',
            form.data.ratings.map((r) => (r.metric_id === metricId ? { ...r, [field]: value } : r))
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post(`/admin/performance/${vendor.id}/rate`);
    };

    const header = (
        <PageHeader
            title="Rate Performance"
            subtitle={vendor?.company_name}
            backLink="/admin/performance"
        />
    );

    return (
        <AdminLayout title={`Rate ${vendor?.company_name}`} activeNav="Performance" header={header}>
            <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
                {/* Period Selection */}
                <Card title="Rating Period">
                    <div className="p-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-(--color-text-secondary) mb-2 block">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={form.data.period_start}
                                    onChange={(e) => form.setData('period_start', e.target.value)}
                                    className="input-field w-full"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-(--color-text-secondary) mb-2 block">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={form.data.period_end}
                                    onChange={(e) => form.setData('period_end', e.target.value)}
                                    className="input-field w-full"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Metrics Rating */}
                <Card title="Performance Ratings">
                    <div className="p-6">
                        <p className="text-sm text-(--color-text-secondary) mb-6">
                            Rate the vendor on each metric from 0 to 10. Scores are immutable once
                            submitted.
                        </p>
                        <div className="space-y-6">
                            {metrics.map((metric) => {
                                const rating = form.data.ratings.find(
                                    (r) => r.metric_id === metric.id
                                );
                                return (
                                    <div
                                        key={metric.id}
                                        className="p-4 rounded-lg bg-(--color-bg-secondary) border border-(--color-border-secondary)"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="text-(--color-text-primary) font-medium">
                                                    {metric.display_name}
                                                </div>
                                                <div className="text-sm text-(--color-text-secondary)">
                                                    {metric.description}
                                                </div>
                                                <span className="text-xs text-(--color-brand-primary) mt-1 inline-block">
                                                    Weight: {(metric.weight * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="text-3xl font-bold text-(--color-text-primary)">
                                                {rating?.score || 0}/{metric.max_score}
                                            </div>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max={metric.max_score}
                                            value={rating?.score || 0}
                                            onChange={(e) =>
                                                updateRating(
                                                    metric.id,
                                                    'score',
                                                    parseInt(e.target.value)
                                                )
                                            }
                                            className="w-full h-2 bg-(--color-bg-tertiary) rounded-lg appearance-none cursor-pointer accent-indigo-500 mb-2"
                                        />
                                        <input
                                            type="text"
                                            value={rating?.notes || ''}
                                            onChange={(e) =>
                                                updateRating(metric.id, 'notes', e.target.value)
                                            }
                                            className="input-field w-full text-sm"
                                            placeholder="Optional notes..."
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Card>

                {/* Submit */}
                <div className="flex justify-end gap-3">
                    <Link href="/admin/performance">
                        <Button variant="outline">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Submitting...' : 'Submit Ratings'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
