import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    AdminLayout,
    Badge,
    Button,
    Card,
    DataTable,
    FormSelect,
    PageHeader,
    StatCard,
    StatGrid,
} from '@/Components';
const formatPaginationLabel = (label) =>
    String(label || '')
        .replace(/&laquo;/g, '<<')
        .replace(/&raquo;/g, '>>')
        .replace(/<[^>]*>/g, '')
        .trim();

function formatDuration(durationMs) {
    if (durationMs === null || durationMs === undefined) return '-';
    if (durationMs < 1000) return `${durationMs} ms`;
    if (durationMs < 60000) return `${(durationMs / 1000).toFixed(1)} s`;

    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.round((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
}

function mapJobStatus(status) {
    if (status === 'success') return 'success';
    if (status === 'failed') return 'error';
    if (status === 'running') return 'info';

    return 'warning';
}

export default function SystemHealthIndex({ jobs = {}, stats = {}, filters = {} }) {
    const rows = jobs?.data ?? [];
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');

    const onSubmitFilters = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        router.get(
            '/admin/system-health',
            {
                status: statusFilter || 'all',
                search: formData.get('search') || '',
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            }
        );
    };

    const columns = [
        {
            header: 'Job',
            render: (row) => (
                <span className="font-mono text-xs text-(--color-text-primary)">
                    {row.job_name}
                </span>
            ),
        },
        {
            header: 'Status',
            align: 'center',
            render: (row) => <Badge status={mapJobStatus(row.status)}>{row.status}</Badge>,
        },
        {
            header: 'Started',
            render: (row) => (
                <span className="text-(--color-text-secondary)">{row.started_at || '-'}</span>
            ),
        },
        {
            header: 'Duration',
            align: 'center',
            render: (row) => (
                <span className="text-(--color-text-secondary)">
                    {formatDuration(row.duration_ms)}
                </span>
            ),
        },
        {
            header: 'Finished',
            render: (row) => (
                <span className="text-(--color-text-secondary)">{row.finished_at || '-'}</span>
            ),
        },
        {
            header: 'Error',
            render: (row) => (
                <span className="text-xs text-(--color-danger)">
                    {row.error_message ? String(row.error_message).slice(0, 80) : '-'}
                </span>
            ),
        },
    ];

    const header = (
        <PageHeader
            title="System Health"
            subtitle="Background jobs, failures, and execution visibility"
        />
    );

    return (
        <AdminLayout title="System Health" activeNav="System Health" header={header}>
            <div className="space-y-6">
                <StatGrid cols={4}>
                    <StatCard label="Total Jobs" value={stats.total || 0} icon="jobs" />
                    <StatCard
                        label="Running"
                        value={stats.running || 0}
                        icon="running"
                        color="info"
                    />
                    <StatCard
                        label="Successful"
                        value={stats.success || 0}
                        icon="success"
                        color="success"
                    />
                    <StatCard
                        label="Failed"
                        value={stats.failed || 0}
                        icon="failed"
                        color="danger"
                    />
                </StatGrid>

                <Card title="Filters" allowOverflow>
                    <form
                        onSubmit={onSubmitFilters}
                        className="p-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-end"
                    >
                        <label className="block min-w-0">
                            <span className="text-xs uppercase tracking-wide text-(--color-text-tertiary)">
                                Status
                            </span>
                            <FormSelect
                                name="status"
                                value={statusFilter}
                                onChange={setStatusFilter}
                                className="mt-1"
                                options={[
                                    { value: 'all', label: 'All' },
                                    { value: 'running', label: 'Running' },
                                    { value: 'success', label: 'Success' },
                                    { value: 'failed', label: 'Failed' },
                                ]}
                            />
                        </label>

                        <label className="block min-w-0">
                            <span className="text-xs uppercase tracking-wide text-(--color-text-tertiary)">
                                Job Name
                            </span>
                            <input
                                type="text"
                                name="search"
                                defaultValue={filters?.search || ''}
                                placeholder="vendors:evaluate-compliance"
                                className="mt-1 w-full rounded-xl border-2 border-(--color-border-primary) bg-white px-4 py-3 text-sm text-(--color-text-primary) placeholder:text-(--color-text-placeholder) transition-colors hover:border-(--color-border-secondary) focus:outline-none focus:border-(--color-brand-primary) focus:ring-4 focus:ring-(--color-brand-primary)/10"
                            />
                        </label>

                        <Button
                            type="submit"
                            className="h-11 min-w-[160px] justify-center rounded-xl px-6 text-sm font-semibold"
                        >
                            Apply
                        </Button>
                    </form>
                </Card>

                <DataTable columns={columns} data={rows} emptyMessage="No job logs found" />

                {Array.isArray(jobs?.links) && jobs.links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {jobs.links.map((link, index) => (
                            <button
                                key={`${link.label}-${index}`}
                                type="button"
                                disabled={!link.url}
                                onClick={() =>
                                    link.url &&
                                    router.visit(link.url, {
                                        preserveScroll: true,
                                        preserveState: true,
                                    })
                                }
                                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                                    link.active
                                        ? 'bg-(--color-brand-primary) text-white border-(--color-brand-primary)'
                                        : 'bg-white text-(--color-text-secondary) border-(--color-border-primary) disabled:opacity-40'
                                }`}
                            >
                                {formatPaginationLabel(link.label)}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
