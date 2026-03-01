import { Link } from '@inertiajs/react';
import { AdminLayout, PageHeader, DataTable, Badge, Button, AppIcon } from '@/Components';

export default function PerformanceIndex({
    vendors = [],
    metrics = [],
    topPerformers = [],
    lowPerformers = [],
}) {
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-(--color-success)';
        if (score >= 60) return 'text-(--color-warning)';
        if (score >= 40) return 'text-(--color-warning-dark)';
        return 'text-(--color-danger)';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-(--color-success)';
        if (score >= 60) return 'bg-(--color-warning)';
        if (score >= 40) return 'bg-(--color-warning-dark)';
        return 'bg-(--color-danger)';
    };

    const columns = [
        {
            header: 'Vendor',
            render: (row) => (
                <span className="text-(--color-text-primary) font-medium">{row.company_name}</span>
            ),
        },
        {
            header: 'Score',
            align: 'center',
            render: (row) => (
                <span className={`text-xl font-bold ${getScoreColor(row.performance_score)}`}>
                    {row.performance_score}
                </span>
            ),
        },
        {
            header: 'Progress',
            render: (row) => (
                <div className="w-full bg-(--color-bg-tertiary) rounded-full h-2 max-w-[150px]">
                    <div
                        className={`h-2 rounded-full ${getScoreBg(row.performance_score)}`}
                        style={{ width: `${row.performance_score}%` }}
                    />
                </div>
            ),
        },
        { header: 'Compliance', render: (row) => <Badge status={row.compliance_status} /> },
        {
            header: 'Actions',
            align: 'right',
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/performance/${row.id}`}>
                        <Button variant="outline" size="sm">
                            View
                        </Button>
                    </Link>
                    <Link href={`/admin/performance/${row.id}/rate`}>
                        <Button variant="primary" size="sm">
                            Rate
                        </Button>
                    </Link>
                </div>
            ),
        },
    ];

    const header = (
        <PageHeader title="Performance Dashboard" subtitle="Track and rate vendor performance" />
    );

    return (
        <AdminLayout title="Performance Dashboard" activeNav="Performance" header={header}>
            <div className="space-y-8">
                <div className="bg-(--color-bg-primary) rounded-xl border border-(--color-border-primary) shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-(--color-text-primary) mb-4">
                        Performance Metrics
                    </h2>
                    <div className="grid md:grid-cols-4 gap-4">
                        {metrics.map((metric) => (
                            <div
                                key={metric.id}
                                className="p-4 rounded-lg bg-(--color-bg-secondary) border border-(--color-border-secondary)"
                            >
                                <div className="text-(--color-text-primary) font-medium">
                                    {metric.display_name}
                                </div>
                                <div className="text-sm text-(--color-text-tertiary) mt-1">
                                    {metric.description}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-(--color-brand-primary)">
                                        Weight: {(metric.weight * 100).toFixed(0)}%
                                    </span>
                                    <span className="text-xs text-(--color-text-tertiary)">
                                        Max: {metric.max_score}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-(--color-bg-primary) rounded-xl border border-(--color-border-primary) shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-(--color-text-primary) mb-4 flex items-center gap-2">
                            <AppIcon name="metrics" className="h-5 w-5" /> Top Performers
                        </h2>
                        <div className="space-y-3">
                            {topPerformers.map((vendor, idx) => (
                                <div
                                    key={vendor.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-(--color-bg-secondary) border border-(--color-border-secondary)"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-(--color-warning-light) flex items-center justify-center text-(--color-warning) font-bold text-sm">
                                            {idx + 1}
                                        </div>
                                        <span className="text-(--color-text-primary) font-medium">
                                            {vendor.company_name}
                                        </span>
                                    </div>
                                    <span
                                        className={`text-xl font-bold ${getScoreColor(vendor.performance_score)}`}
                                    >
                                        {vendor.performance_score}
                                    </span>
                                </div>
                            ))}
                            {topPerformers.length === 0 && (
                                <div className="text-center text-(--color-text-tertiary) py-4">
                                    No data yet
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-(--color-bg-primary) rounded-xl border border-(--color-border-primary) shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-(--color-text-primary) mb-4 flex items-center gap-2">
                            <AppIcon name="warning" className="h-5 w-5" /> Needs Improvement
                        </h2>
                        <div className="space-y-3">
                            {lowPerformers.map((vendor) => (
                                <div
                                    key={vendor.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-(--color-bg-secondary) border border-(--color-border-secondary)"
                                >
                                    <span className="text-(--color-text-primary) font-medium">
                                        {vendor.company_name}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`text-xl font-bold ${getScoreColor(vendor.performance_score)}`}
                                        >
                                            {vendor.performance_score}
                                        </span>
                                        <Link href={`/admin/performance/${vendor.id}/rate`}>
                                            <Button variant="primary" size="sm">
                                                Rate
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                            {lowPerformers.length === 0 && (
                                <div className="text-center text-(--color-text-tertiary) py-4">
                                    No data yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={vendors}
                    emptyMessage="No approved or active vendors available for rating"
                />
            </div>
        </AdminLayout>
    );
}
