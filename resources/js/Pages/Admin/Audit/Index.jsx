import { AdminLayout, PageHeader, DataTable, Badge, Card } from '@/Components';

export default function AuditIndex({ logs = [] }) {
    const columns = [
        {
            header: 'Time',
            render: (row) => (
                <span className="text-(--color-text-secondary) text-sm">{row.created_at}</span>
            ),
        },
        {
            header: 'User',
            render: (row) => (
                <span className="text-(--color-text-primary) font-medium">
                    {row.user?.name || 'System'}
                </span>
            ),
        },
        {
            header: 'Event',
            render: (row) => (
                <Badge status={row.event_type || 'info'}>{row.event || 'Action'}</Badge>
            ),
        },
        {
            header: 'Entity',
            render: (row) => (
                <span className="text-(--color-text-secondary) capitalize">
                    {row.auditable_type?.split('\\').pop()}
                </span>
            ),
        },
        {
            header: 'Description',
            render: (row) => (
                <span className="text-(--color-text-secondary) text-sm">
                    {row.reason || row.description || 'No details'}
                </span>
            ),
        },
        {
            header: 'IP',
            render: (row) => (
                <span className="text-(--color-text-tertiary) font-mono text-xs">
                    {row.ip_address || '-'}
                </span>
            ),
        },
    ];

    const header = <PageHeader title="Audit Logs" subtitle="System activity and change history" />;

    return (
        <AdminLayout title="Audit Logs" activeNav="Audit Logs" header={header}>
            <Card className="overflow-hidden">
                <DataTable
                    columns={columns}
                    data={logs}
                    emptyMessage="No audit logs recorded"
                    stickyHeader={true}
                />
            </Card>
        </AdminLayout>
    );
}
