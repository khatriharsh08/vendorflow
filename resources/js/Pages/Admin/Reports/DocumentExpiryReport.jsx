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

export default function DocumentExpiryReport({ documents, stats, filters }) {
    const { auth } = usePage().props;
    const can = auth?.can || {};

    const [localFilters, setLocalFilters] = useState({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
    });

    const handleFilter = () => {
        router.get('/admin/reports/document-expiry', localFilters, { preserveState: true });
    };

    const handleExport = () => {
        const params = new URLSearchParams(localFilters).toString();
        window.location.href = `/admin/reports/export/document_expiry?${params}`;
    };

    const getExpiryBadge = (daysUntil) => {
        if (daysUntil === null) return <Badge variant="default">Unknown</Badge>;
        if (daysUntil < 0) return <Badge variant="danger">Expired</Badge>;
        if (daysUntil <= 7) return <Badge variant="danger">{daysUntil} days</Badge>;
        if (daysUntil <= 30) return <Badge variant="warning">{daysUntil} days</Badge>;
        return <Badge variant="success">{daysUntil} days</Badge>;
    };

    const columns = [
        {
            key: 'vendor',
            label: 'Vendor',
            render: (row) => (
                <span className="text-(--color-text-primary) font-medium">
                    {row.vendor?.company_name || 'N/A'}
                </span>
            ),
        },
        {
            key: 'document_type',
            label: 'Document Type',
            render: (row) => (
                <span className="text-(--color-text-secondary)">
                    {row.document_type?.display_name || row.document_type?.name || 'N/A'}
                </span>
            ),
        },
        {
            key: 'file_name',
            label: 'File',
            render: (row) => <span className="text-(--color-text-secondary)">{row.file_name}</span>,
        },
        {
            key: 'expiry_date',
            label: 'Expiry Date',
            render: (row) => (
                <span className="text-(--color-text-primary)">{row.expiry_formatted}</span>
            ),
        },
        {
            key: 'days_until',
            label: 'Status',
            render: (row) => getExpiryBadge(row.days_until_expiry),
        },
    ];

    const header = (
        <PageHeader
            title="Document Expiry Report"
            subtitle="Documents expiring within selected date range"
            actions={
                <Link href="/admin/reports">
                    <Button variant="secondary">Back to Reports</Button>
                </Link>
            }
        />
    );

    return (
        <AdminLayout title="Document Expiry Report" activeNav="Reports" header={header}>
            <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                    <StatCard
                        label="Expiring in 7 Days"
                        value={stats.expiring_7_days}
                        icon="warning"
                        color="danger"
                    />
                    <StatCard
                        label="Expiring in 30 Days"
                        value={stats.expiring_30_days}
                        icon="clock"
                        color="warning"
                    />
                    <StatCard
                        label="Already Expired"
                        value={stats.expired}
                        icon="error"
                        color="danger"
                    />
                    <StatCard
                        label="Total with Expiry"
                        value={stats.total_with_expiry}
                        icon="documents"
                        color="info"
                    />
                </div>

                {/* Filters */}
                <Card title="Date Range">
                    <div className="p-4 flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm font-medium text-(--color-text-secondary) mb-1">
                                Start Date
                            </label>
                            <FormInput
                                type="date"
                                value={localFilters.start_date}
                                onChange={(value) =>
                                    setLocalFilters({ ...localFilters, start_date: value })
                                }
                            />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm font-medium text-(--color-text-secondary) mb-1">
                                End Date
                            </label>
                            <FormInput
                                type="date"
                                value={localFilters.end_date}
                                onChange={(value) =>
                                    setLocalFilters({ ...localFilters, end_date: value })
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
                <Card title={`Expiring Documents (${documents?.data?.length || 0} shown)`}>
                    <DataTable
                        columns={columns}
                        data={documents?.data || []}
                        links={documents?.links || []}
                        emptyMessage="No documents found for the selected date range."
                    />
                </Card>
            </div>
        </AdminLayout>
    );
}
