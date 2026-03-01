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
    FormSelect,
} from '@/Components';

export default function VendorSummaryReport({ vendors, stats, filters }) {
    const { auth } = usePage().props;
    const can = auth?.can || {};

    const [localFilters, setLocalFilters] = useState({
        status: filters.status || 'all',
        compliance: filters.compliance || 'all',
    });

    const handleFilter = () => {
        router.get('/admin/reports/vendor-summary', localFilters, { preserveState: true });
    };

    const handleExport = () => {
        const params = new URLSearchParams(localFilters).toString();
        window.location.href = `/admin/reports/export/vendor_summary?${params}`;
    };

    const statusOptions = [
        { value: 'all', label: 'All Statuses' },
        { value: 'draft', label: 'Draft' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'under_review', label: 'Under Review' },
        { value: 'approved', label: 'Approved' },
        { value: 'active', label: 'Active' },
        { value: 'suspended', label: 'Suspended' },
    ];

    const complianceOptions = [
        { value: 'all', label: 'All Compliance' },
        { value: 'compliant', label: 'Compliant' },
        { value: 'non_compliant', label: 'Non-Compliant' },
        { value: 'pending', label: 'Pending' },
    ];

    const getStatusBadge = (status) => {
        const variants = {
            draft: 'default',
            submitted: 'warning',
            under_review: 'info',
            approved: 'success',
            active: 'success',
            suspended: 'danger',
        };
        return <Badge variant={variants[status] || 'default'}>{status.replace('_', ' ')}</Badge>;
    };

    const getComplianceBadge = (status) => {
        const variants = {
            compliant: 'success',
            non_compliant: 'danger',
            pending: 'warning',
        };
        return <Badge variant={variants[status] || 'default'}>{status.replace('_', ' ')}</Badge>;
    };

    const columns = [
        { key: 'id', label: 'ID', render: (row) => `#${row.id}` },
        { key: 'company_name', label: 'Company', render: (row) => row.company_name },
        { key: 'contact_person', label: 'Contact', render: (row) => row.contact_person || '-' },
        { key: 'status', label: 'Status', render: (row) => getStatusBadge(row.status) },
        {
            key: 'compliance_status',
            label: 'Compliance',
            render: (row) => getComplianceBadge(row.compliance_status),
        },
        {
            key: 'compliance_score',
            label: 'Comp. Score',
            render: (row) => `${row.compliance_score || 0}%`,
        },
        {
            key: 'performance_score',
            label: 'Perf. Score',
            render: (row) => `${row.performance_score || 0}%`,
        },
    ];

    const header = (
        <PageHeader
            title="Vendor Summary Report"
            subtitle="Overview of all vendors by status and compliance"
            actions={
                <Link href="/admin/reports">
                    <Button variant="secondary">Back to Reports</Button>
                </Link>
            }
        />
    );

    return (
        <AdminLayout title="Vendor Summary Report" activeNav="Reports" header={header}>
            <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Vendors"
                        value={stats.total}
                        icon="vendors"
                        color="primary"
                    />
                    <StatCard label="Active" value={stats.active} icon="success" color="success" />
                    <StatCard
                        label="Compliant"
                        value={stats.compliant}
                        icon="compliance"
                        color="info"
                    />
                    <StatCard
                        label="Avg Performance"
                        value={`${stats.avg_performance_score}%`}
                        icon="trend"
                        color="warning"
                    />
                </div>

                {/* Filters */}
                <Card title="Filters" allowOverflow>
                    <div className="p-4 flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm font-medium text-(--color-text-secondary) mb-1">
                                Status
                            </label>
                            <FormSelect
                                value={localFilters.status}
                                onChange={(val) =>
                                    setLocalFilters({ ...localFilters, status: val })
                                }
                                options={statusOptions}
                            />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm font-medium text-(--color-text-secondary) mb-1">
                                Compliance
                            </label>
                            <FormSelect
                                value={localFilters.compliance}
                                onChange={(val) =>
                                    setLocalFilters({ ...localFilters, compliance: val })
                                }
                                options={complianceOptions}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleFilter}>Apply Filters</Button>
                            {can['reports.export'] && (
                                <Button variant="secondary" onClick={handleExport}>
                                    Export CSV
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Data Table */}
                <Card title={`Vendors (${vendors?.data?.length || 0} shown)`}>
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
