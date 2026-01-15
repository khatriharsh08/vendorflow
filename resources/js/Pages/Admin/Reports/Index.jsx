import { useState } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { AdminLayout, PageHeader, Card, StatCard, Button, FormSelect } from '@/Components';

export default function ReportsIndex({ stats = {}, reports = [] }) {
    const [dateRange, setDateRange] = useState('this_month');
    const { auth } = usePage().props;
    const can = auth?.can || {};

    const reportTypes = [
        { id: 'vendor_summary', title: 'Vendor Summary', description: 'Overview of all vendors by status, compliance, and performance', icon: '🏢', permission: 'vendors.view', route: '/admin/reports/vendor-summary' },
        { id: 'compliance_report', title: 'Compliance Report', description: 'Detailed compliance status and rule violations', icon: '🛡️', permission: 'compliance.view', route: '/admin/reports/compliance' },
        { id: 'payment_report', title: 'Payment Report', description: 'Payment requests, approvals, and disbursements', icon: '💰', permission: 'payments.view', route: '/admin/reports/payment' },
        { id: 'document_expiry', title: 'Document Expiry Report', description: 'Documents expiring within selected date range', icon: '📄', permission: 'documents.view', route: '/admin/reports/document-expiry' },
        { id: 'performance_report', title: 'Performance Report', description: 'Vendor performance scores and trends', icon: '📈', permission: 'vendors.view', route: '/admin/reports/performance' },
        { id: 'audit_trail', title: 'Audit Trail Report', description: 'Complete history of all system activities', icon: '📋', permission: 'audit.view', route: '/admin/audit' },
    ];

    const allowedReports = reportTypes.filter(report => !report.permission || can[report.permission]);

    const dateOptions = [
        { value: 'today', label: 'Today' },
        { value: 'this_week', label: 'This Week' },
        { value: 'this_month', label: 'This Month' },
        { value: 'this_quarter', label: 'This Quarter' },
        { value: 'this_year', label: 'This Year' },
    ];

    const header = (
        <PageHeader 
            title="Reports"
            subtitle="Generate and download reports"
            actions={
                <FormSelect 
                    value={dateRange}
                    onChange={setDateRange}
                    options={dateOptions}
                />
            }
        />
    );

    return (
        <AdminLayout title="Reports" activeNav="Reports" header={header}>
            <div className="space-y-8">
                {/* Quick Stats - from backend */}
                <div className="grid md:grid-cols-5 gap-4">
                    <StatCard label="Total Vendors" value={stats.total_vendors || 0} icon="🏢" color="primary" />
                    <StatCard label="Active Vendors" value={stats.active_vendors || 0} icon="✅" color="success" />
                    <StatCard label="Compliance Rate" value={`${stats.compliance_rate || 0}%`} icon="🛡️" color="info" />
                    <StatCard label="Pending Payments" value={stats.pending_payments || 0} icon="⏳" color="warning" />
                    <StatCard label="Total Paid" value={`₹${((stats.total_paid || 0) / 100000).toFixed(1)}L`} icon="💰" color="success" />
                </div>

                {/* Available Reports */}
                <Card title="Available Reports">
                    {allowedReports.length > 0 ? (
                        <div className="p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {allowedReports.map((report) => (
                                <div 
                                    key={report.id} 
                                    className="p-5 rounded-xl bg-(--color-bg-secondary) border border-(--color-border-secondary) hover:border-(--color-brand-primary-light) hover:shadow-lg transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-(--gradient-primary) text-white flex items-center justify-center text-2xl shadow-(--shadow-primary) group-hover:scale-110 transition-transform">
                                            {report.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-(--color-text-primary) font-semibold mb-1">{report.title}</h3>
                                            <p className="text-sm text-(--color-text-tertiary)">{report.description}</p>
                                            <div className="flex gap-2 mt-3">
                                                {report.route ? (
                                                    <Link href={report.route}>
                                                        <Button variant="ghost" size="sm">View</Button>
                                                    </Link>
                                                ) : (
                                                    <Button variant="ghost" size="sm" disabled>View</Button>
                                                )}
                                                {can['reports.export'] && report.route && (
                                                    <a href={`/admin/reports/export/${report.id.replace('_report', '')}?`}>
                                                        <Button variant="secondary" size="sm">Export CSV</Button>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-(--color-text-tertiary)">
                            No reports available for your role.
                        </div>
                    )}
                </Card>

                {/* Scheduled Jobs */}
                <Card title="Scheduled Jobs">
                    <div className="p-4">
                        <p className="text-(--color-text-tertiary) text-sm mb-4">These commands run automatically but can also be triggered manually:</p>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="relative p-4 rounded-xl overflow-hidden shadow-lg shadow-indigo-100 border border-indigo-100">
                                <div className="absolute inset-0 opacity-50" style={{ background: 'var(--gradient-primary)' }} />
                                <div className="relative z-10 text-(--color-text-primary)">
                                    <div className="font-semibold mb-1">Compliance Evaluation</div>
                                    <div className="text-xs text-(--color-text-secondary) mb-2">Runs daily at 2:00 AM</div>
                                    <code className="text-xs bg-white/60 px-2 py-1 rounded block text-(--color-text-primary)">php artisan vendors:evaluate-compliance</code>
                                </div>
                            </div>
                            <div className="relative p-4 rounded-xl overflow-hidden shadow-lg shadow-emerald-100 border border-emerald-100">
                                <div className="absolute inset-0 opacity-50" style={{ background: 'var(--gradient-success)' }} />
                                <div className="relative z-10 text-(--color-text-primary)">
                                    <div className="font-semibold mb-1">Expiry Reminders</div>
                                    <div className="text-xs text-(--color-text-secondary) mb-2">Runs daily at 8:00 AM</div>
                                    <code className="text-xs bg-white/60 px-2 py-1 rounded block text-(--color-text-primary)">php artisan vendors:expiry-reminders</code>
                                </div>
                            </div>
                            <div className="relative p-4 rounded-xl overflow-hidden shadow-lg shadow-amber-100 border border-amber-100">
                                <div className="absolute inset-0 opacity-50" style={{ background: 'var(--gradient-warning)' }} />
                                <div className="relative z-10 text-(--color-text-primary)">
                                    <div className="font-semibold mb-1">Weekly Summary</div>
                                    <div className="text-xs text-(--color-text-secondary) mb-2">Runs every Monday</div>
                                    <code className="text-xs bg-white/60 px-2 py-1 rounded block text-(--color-text-primary)">php artisan vendors:weekly-summary</code>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}
