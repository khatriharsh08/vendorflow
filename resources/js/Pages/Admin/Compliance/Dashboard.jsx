import { Link, router, usePage } from '@inertiajs/react';
import {
    AdminLayout,
    AppIcon,
    Badge,
    Button,
    Card,
    PageHeader,
    StatCard,
    StatGrid,
} from '@/Components';

export default function ComplianceDashboard({ stats, atRiskVendors, recentResults, rules }) {
    const { auth } = usePage().props;
    const can = auth?.can || {};

    const runEvaluation = () => {
        if (confirm('Run compliance evaluation for all vendors?')) {
            router.post('/admin/compliance/evaluate-all');
        }
    };

    const header = (
        <PageHeader
            title="Compliance Dashboard"
            subtitle="Monitor vendor compliance status"
            actions={can.run_compliance && <Button onClick={runEvaluation}>Run Evaluation</Button>}
        />
    );

    return (
        <AdminLayout title="Compliance Dashboard" activeNav="Compliance" header={header}>
            <div className="space-y-8">
                {/* Stats */}
                <StatGrid>
                    <StatCard
                        label="Compliant"
                        value={stats?.compliant || 0}
                        icon="success"
                        color="success"
                    />
                    <StatCard
                        label="At Risk"
                        value={stats?.at_risk || 0}
                        icon="warning"
                        color="warning"
                    />
                    <StatCard
                        label="Non-Compliant"
                        value={stats?.non_compliant || 0}
                        icon="error"
                        color="danger"
                    />
                    <StatCard
                        label="Blocked"
                        value={stats?.blocked || 0}
                        icon="failed"
                        color="danger"
                    />
                </StatGrid>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* At Risk Vendors */}
                    <Card title="Vendors Needing Attention">
                        <div className="p-4 space-y-3">
                            {atRiskVendors && atRiskVendors.length > 0 ? (
                                atRiskVendors.map((vendor) => (
                                    <Link
                                        key={vendor.id}
                                        href={`/admin/vendors/${vendor.id}`}
                                        className="flex items-center justify-between p-3 rounded-xl bg-(--color-bg-secondary) hover:bg-(--color-bg-tertiary) border border-(--color-border-secondary) transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-(--color-brand-primary-light) flex items-center justify-center">
                                                <AppIcon name="vendors" className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-(--color-text-primary) font-medium">
                                                    {vendor.company_name}
                                                </div>
                                                <div className="text-sm text-(--color-text-tertiary)">
                                                    Score: {vendor.compliance_score}%
                                                </div>
                                            </div>
                                        </div>
                                        <Badge status={vendor.compliance_status} />
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center text-(--color-text-tertiary) py-8">
                                    All vendors are compliant!
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Recent Failures */}
                    <Card title="Recent Compliance Failures">
                        <div className="p-4 space-y-3">
                            {recentResults && recentResults.length > 0 ? (
                                recentResults.map((result) => (
                                    <div
                                        key={result.id}
                                        className="p-3 rounded-xl bg-(--color-bg-secondary) border border-(--color-border-secondary) border-l-4 border-l-(--color-danger)"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="text-(--color-text-primary) font-medium">
                                                {result.vendor?.company_name}
                                            </div>
                                            <div className="text-xs text-(--color-text-muted)">
                                                {result.evaluated_at}
                                            </div>
                                        </div>
                                        <div className="text-sm text-(--color-danger) mt-1">
                                            {result.rule?.name?.replace(/_/g, ' ')}
                                        </div>
                                        <div className="text-sm text-(--color-text-tertiary) mt-1">
                                            {result.details}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-(--color-text-tertiary) py-8">
                                    No recent failures
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Compliance Rules */}
                <Card
                    title="Compliance Rules"
                    action={
                        <Link
                            href="/admin/compliance/rules"
                            className="text-(--color-brand-primary) hover:text-(--color-brand-primary-hover) text-sm font-medium"
                        >
                            Manage Rules
                        </Link>
                    }
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-(--color-border-primary) bg-(--color-bg-secondary)">
                                    <th className="text-left p-4 text-xs font-semibold text-(--color-text-tertiary) uppercase tracking-wider">
                                        Rule
                                    </th>
                                    <th className="text-left p-4 text-xs font-semibold text-(--color-text-tertiary) uppercase tracking-wider">
                                        Severity
                                    </th>
                                    <th className="text-center p-4 text-xs font-semibold text-(--color-text-tertiary) uppercase tracking-wider">
                                        Penalty
                                    </th>
                                    <th className="text-center p-4 text-xs font-semibold text-(--color-text-tertiary) uppercase tracking-wider">
                                        Blocks Payment
                                    </th>
                                    <th className="text-center p-4 text-xs font-semibold text-(--color-text-tertiary) uppercase tracking-wider">
                                        Failures
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rules &&
                                    rules.map((rule) => (
                                        <tr
                                            key={rule.id}
                                            className="border-b border-(--color-border-secondary) hover:bg-(--color-bg-hover)"
                                        >
                                            <td className="p-4">
                                                <div className="text-(--color-text-primary) capitalize font-medium">
                                                    {rule.name?.replace(/_/g, ' ')}
                                                </div>
                                                <div className="text-xs text-(--color-text-tertiary)">
                                                    {rule.description}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge status={rule.severity} />
                                            </td>
                                            <td className="p-4 text-center text-(--color-text-primary) font-medium">
                                                {rule.penalty_points}
                                            </td>
                                            <td className="p-4 text-center">
                                                {rule.blocks_payment ? (
                                                    <span className="text-(--color-danger) font-medium">
                                                        Yes
                                                    </span>
                                                ) : (
                                                    <span className="text-(--color-text-muted)">
                                                        No
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center text-(--color-text-primary) font-medium">
                                                {rule.failures_count || 0}
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
