import { Link } from '@inertiajs/react';
import { AdminLayout, Badge, Card, DataTable, PageHeader, StatCard, StatGrid } from '@/Components';

export default function PerformanceShow({ vendor, breakdown = [], history = [] }) {
    const currentScore = Number(vendor?.performance_score || 0);
    const averageMetricScore =
        breakdown.length > 0
            ? Math.round(
                  breakdown.reduce(
                      (total, metric) =>
                          total +
                          ((Number(metric.current_score || 0) /
                              Math.max(1, Number(metric.max_score || 1))) *
                              100 || 0),
                      0
                  ) / breakdown.length
              )
            : 0;

    const columns = [
        {
            header: 'Metric',
            render: (row) => (
                <span className="font-medium text-(--color-text-primary)">{row.metric_name}</span>
            ),
        },
        {
            header: 'Weight',
            align: 'center',
            render: (row) => (
                <span className="text-(--color-text-secondary)">
                    {Math.round(row.weight * 100)}%
                </span>
            ),
        },
        {
            header: 'Current',
            align: 'center',
            render: (row) => (
                <span className="font-semibold text-(--color-text-primary)">
                    {row.current_score}/{row.max_score}
                </span>
            ),
        },
        {
            header: 'Average',
            align: 'center',
            render: (row) => (
                <span className="text-(--color-text-secondary)">{row.average_score}</span>
            ),
        },
        {
            header: 'History Count',
            align: 'center',
            render: (row) => (
                <span className="text-(--color-text-secondary)">{row.score_count}</span>
            ),
        },
    ];

    const header = (
        <PageHeader
            title={`${vendor?.company_name || 'Vendor'} Performance`}
            subtitle="Detailed metric breakdown and monthly trend"
            actions={
                <div className="flex items-center gap-2">
                    <Link
                        href={`/admin/performance/${vendor?.id}/rate`}
                        className="px-4 py-2 rounded-lg bg-(--color-brand-primary) text-white text-sm font-medium hover:bg-(--color-brand-primary-hover) transition-colors"
                    >
                        Add Rating
                    </Link>
                    <Link
                        href="/admin/performance"
                        className="px-4 py-2 rounded-lg border border-(--color-border-primary) text-(--color-text-secondary) text-sm font-medium hover:bg-(--color-bg-secondary) transition-colors"
                    >
                        Back
                    </Link>
                </div>
            }
        />
    );

    return (
        <AdminLayout title="Vendor Performance" activeNav="Performance" header={header}>
            <div className="space-y-6">
                <StatGrid cols={4}>
                    <StatCard
                        label="Current Score"
                        value={currentScore}
                        icon="score"
                        color="primary"
                    />
                    <StatCard
                        label="Metric Average"
                        value={averageMetricScore}
                        icon="average"
                        color="info"
                    />
                    <StatCard
                        label="Active Metrics"
                        value={breakdown.length}
                        icon="metrics"
                        color="success"
                    />
                    <StatCard
                        label="Trend Points"
                        value={history.length}
                        icon="trend"
                        color="warning"
                    />
                </StatGrid>

                <Card title="Compliance Status">
                    <div className="p-4">
                        <Badge status={vendor?.compliance_status || 'info'}>
                            {vendor?.compliance_status || 'unknown'}
                        </Badge>
                    </div>
                </Card>

                <Card title="Metric Breakdown">
                    <DataTable
                        columns={columns}
                        data={breakdown}
                        emptyMessage="No performance scores yet"
                    />
                </Card>

                <Card title="Monthly Trend">
                    <div className="p-4 space-y-3">
                        {history.length === 0 && (
                            <p className="text-(--color-text-tertiary)">
                                No monthly history available.
                            </p>
                        )}

                        {history.map((entry) => (
                            <div
                                key={entry.month}
                                className="rounded-lg border border-(--color-border-primary) p-3 flex items-center justify-between"
                            >
                                <div>
                                    <div className="font-medium text-(--color-text-primary)">
                                        {entry.month}
                                    </div>
                                    <div className="text-xs text-(--color-text-tertiary)">
                                        Metrics recorded: {entry.scores?.length || 0}
                                    </div>
                                </div>
                                <div className="text-lg font-bold text-(--color-text-primary)">
                                    {entry.average}/100
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}
