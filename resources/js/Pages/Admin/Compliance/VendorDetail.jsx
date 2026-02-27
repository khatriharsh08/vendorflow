import { Link } from '@inertiajs/react';
import { AdminLayout, PageHeader, Card, StatCard, StatGrid, Badge, Button } from '@/Components';

export default function VendorComplianceDetail({ vendor, results, summary }) {
    const header = (
        <PageHeader
            title={`Compliance Detail: ${vendor?.company_name || 'Vendor'}`}
            subtitle="Latest rule-wise compliance evaluation"
            actions={
                <Link href="/admin/compliance">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            }
        />
    );

    return (
        <AdminLayout title="Vendor Compliance Detail" activeNav="Compliance" header={header}>
            <div className="space-y-8">
                <StatGrid>
                    <StatCard
                        label="Passing Rules"
                        value={summary?.passing || 0}
                        icon="success"
                        color="success"
                    />
                    <StatCard
                        label="Failing Rules"
                        value={summary?.failing || 0}
                        icon="error"
                        color="danger"
                    />
                    <StatCard
                        label="Warnings"
                        value={summary?.warnings || 0}
                        icon="warning"
                        color="warning"
                    />
                    <StatCard
                        label="Compliance Score"
                        value={`${vendor?.compliance_score ?? 0}%`}
                        icon="metrics"
                        color="info"
                    />
                </StatGrid>

                <Card title="Vendor Status">
                    <div className="p-4 grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <div className="text-(--color-text-tertiary)">Company</div>
                            <div className="text-(--color-text-primary) font-medium">
                                {vendor?.company_name}
                            </div>
                        </div>
                        <div>
                            <div className="text-(--color-text-tertiary)">Lifecycle Status</div>
                            <div className="mt-1">
                                <Badge status={vendor?.status} />
                            </div>
                        </div>
                        <div>
                            <div className="text-(--color-text-tertiary)">Compliance Status</div>
                            <div className="mt-1">
                                <Badge status={vendor?.compliance_status} />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="Rule Results">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-(--color-border-primary) bg-(--color-bg-secondary)">
                                    <th className="text-left p-4 text-xs font-semibold text-(--color-text-tertiary) uppercase tracking-wider">
                                        Rule
                                    </th>
                                    <th className="text-left p-4 text-xs font-semibold text-(--color-text-tertiary) uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="text-left p-4 text-xs font-semibold text-(--color-text-tertiary) uppercase tracking-wider">
                                        Details
                                    </th>
                                    <th className="text-left p-4 text-xs font-semibold text-(--color-text-tertiary) uppercase tracking-wider">
                                        Evaluated At
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {(results || []).map((result) => (
                                    <tr
                                        key={result.id}
                                        className="border-b border-(--color-border-secondary) hover:bg-(--color-bg-hover)"
                                    >
                                        <td className="p-4 text-(--color-text-primary) font-medium">
                                            {result.rule?.name?.replace(/_/g, ' ') || 'Rule'}
                                        </td>
                                        <td className="p-4">
                                            <Badge status={result.status} />
                                        </td>
                                        <td className="p-4 text-(--color-text-secondary)">
                                            {result.details || '-'}
                                        </td>
                                        <td className="p-4 text-(--color-text-tertiary)">
                                            {result.evaluated_at}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}
