import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    AdminLayout,
    PageHeader,
    Card,
    StatCard,
    Button,
    Badge,
    DataTable,
    FormInput,
} from '@/Components';

export default function PerformanceReport({ vendors, stats, filters }) {
    const { auth } = usePage().props;
    const can = auth?.can || {};

    const [localFilters, setLocalFilters] = useState({
        min_score: filters.min_score || '',
    });

    const handleFilter = () => {
        router.get('/admin/reports/performance', localFilters, { preserveState: true });
    };

    const handleExport = () => {
        const params = new URLSearchParams(localFilters).toString();
        window.location.href = `/admin/reports/export/performance?${params}`;
    };

    const getPerformanceBadge = (score) => {
        if (score >= 80) return <Badge variant="success">{score}% - High</Badge>;
        if (score >= 50) return <Badge variant="warning">{score}% - Medium</Badge>;
        return <Badge variant="danger">{score}% - Low</Badge>;
    };

    const columns = [
        { key: 'rank', label: 'Rank', render: (row, idx) => `#${idx + 1}` },
        { key: 'company_name', label: 'Company', render: (row) => row.company_name },
        {
            key: 'performance_score',
            label: 'Performance',
            render: (row) => getPerformanceBadge(row.performance_score || 0),
        },
        {
            key: 'compliance_score',
            label: 'Compliance Score',
            render: (row) => `${row.compliance_score || 0}%`,
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <Badge variant="success">{row.status}</Badge>,
        },
    ];

    const header = (
        <PageHeader
            title="Performance Report"
            subtitle="Vendor performance scores and rankings"
            actions={
                <Link href="/admin/reports">
                    <Button variant="secondary">Back to Reports</Button>
                </Link>
            }
        />
    );

    return (
        <AdminLayout title="Performance Report" activeNav="Reports" header={header}>
            <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                    <StatCard
                        label="Active Vendors"
                        value={stats.total_active}
                        icon="vendors"
                        color="primary"
                    />
                    <StatCard
                        label="Avg Performance"
                        value={`${stats.avg_performance}%`}
                        icon="metrics"
                        color="info"
                    />
                    <StatCard
                        label="High Performers (>=80%)"
                        value={stats.high_performers}
                        icon="metrics"
                        color="success"
                    />
                    <StatCard
                        label="Top Performer"
                        value={stats.top_scorer}
                        icon="success"
                        color="warning"
                    />
                </div>

                {/* Performance Distribution */}
                <Card title="Performance Distribution">
                    <div className="p-4 grid md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-(--color-success-light) border border-(--color-success)/20 text-center">
                            <div className="text-3xl font-bold text-(--color-success)">
                                {stats.high_performers}
                            </div>
                            <div className="text-sm text-(--color-text-secondary)">
                                High Performers (&gt;=80%)
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-(--color-warning-light) border border-(--color-warning)/20 text-center">
                            <div className="text-3xl font-bold text-(--color-warning)">
                                {stats.medium_performers}
                            </div>
                            <div className="text-sm text-(--color-text-secondary)">
                                Medium Performers (50-79%)
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-(--color-danger-light) border border-(--color-danger)/20 text-center">
                            <div className="text-3xl font-bold text-(--color-danger)">
                                {stats.low_performers}
                            </div>
                            <div className="text-sm text-(--color-text-secondary)">
                                Low Performers (&lt;50%)
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Filters */}
                <Card title="Filters">
                    <div className="p-4 flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm font-medium text-(--color-text-secondary) mb-1">
                                Minimum Score
                            </label>
                            <FormInput
                                type="number"
                                min="0"
                                max="100"
                                placeholder="e.g. 50"
                                value={localFilters.min_score}
                                onChange={(value) =>
                                    setLocalFilters({ ...localFilters, min_score: value })
                                }
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleFilter}>Apply Filter</Button>
                            {can['reports.export'] && (
                                <Button variant="secondary" onClick={handleExport}>
                                    Export CSV
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Data Table */}
                <Card title={`Performance Rankings (${vendors?.data?.length || 0} shown)`}>
                    <DataTable
                        columns={columns}
                        data={vendors?.data || []}
                        links={vendors?.links || []}
                        emptyMessage="No vendors found for the selected filters."
                    />
                </Card>
            </div>
        </AdminLayout>
    );
}
