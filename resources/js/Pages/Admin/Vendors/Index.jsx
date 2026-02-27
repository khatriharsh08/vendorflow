import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { AdminLayout, PageHeader, DataTable, Badge, Button } from '@/Components';

export default function VendorsIndex({ vendors = [], currentStatus = 'all', search = '' }) {
    const [searchQuery, setSearchQuery] = useState(search);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            '/admin/vendors',
            { status: currentStatus, search: searchQuery },
            { preserveState: true }
        );
    };

    const columns = [
        {
            header: 'Company',
            render: (row) => (
                <div>
                    <div className="text-(--color-text-primary) font-medium">
                        {row.company_name}
                    </div>
                    <div className="text-sm text-(--color-text-tertiary)">{row.contact_email}</div>
                </div>
            ),
        },
        {
            header: 'Contact',
            render: (row) => (
                <span className="text-(--color-text-secondary)">{row.contact_person}</span>
            ),
        },
        { header: 'Status', render: (row) => <Badge status={row.status} /> },
        {
            header: 'Performance',
            align: 'center',
            render: (row) => (
                <span
                    className={`font-bold ${row.performance_score >= 70 ? 'text-(--color-success)' : row.performance_score >= 40 ? 'text-(--color-warning)' : 'text-(--color-danger)'}`}
                >
                    {row.performance_score || 0}
                </span>
            ),
        },
        { header: 'Compliance', render: (row) => <Badge status={row.compliance_status} /> },
        {
            header: 'Actions',
            align: 'right',
            render: (row) => (
                <Link href={`/admin/vendors/${row.id}`}>
                    <Button variant="ghost" size="sm">
                        View →
                    </Button>
                </Link>
            ),
        },
    ];

    const statusFilters = [
        'all',
        'draft',
        'submitted',
        'under_review',
        'approved',
        'active',
        'suspended',
        'terminated',
        'rejected',
    ];

    const header = (
        <PageHeader
            title="Vendor Management"
            subtitle="Manage and review vendor applications"
            actions={
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search vendors..."
                        className="input-field"
                    />
                    <Button type="submit">Search</Button>
                </form>
            }
        />
    );

    return (
        <AdminLayout title="Vendor Management" activeNav="Vendors" header={header}>
            <div className="space-y-6">
                {/* Status Filters - Using filter-tabs styling */}
                <div className="inline-flex gap-2 p-1 bg-(--color-bg-tertiary) rounded-xl flex-wrap">
                    {statusFilters.map((status) => (
                        <Link
                            key={status}
                            href={`/admin/vendors?status=${status}${searchQuery ? `&search=${searchQuery}` : ''}`}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                                currentStatus === status
                                    ? 'bg-(--color-brand-primary) text-white shadow-(--shadow-primary)'
                                    : 'text-(--color-text-tertiary) hover:text-(--color-text-primary) hover:bg-(--color-bg-primary)'
                            }`}
                        >
                            {status.replace('_', ' ')}
                        </Link>
                    ))}
                </div>

                {/* Vendors Table */}
                <DataTable
                    columns={columns}
                    data={vendors}
                    emptyMessage="No vendors found"
                    onRowClick={(row) => router.visit(`/admin/vendors/${row.id}`)}
                />
            </div>
        </AdminLayout>
    );
}
