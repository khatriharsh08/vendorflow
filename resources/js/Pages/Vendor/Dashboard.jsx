import { Link, usePage } from '@inertiajs/react';
import { VendorLayout, PageHeader, Card, Badge } from '@/Components';

export default function Dashboard({ vendor, recentDocuments = [], stats = {} }) {
    const { auth } = usePage().props;
    const user = auth.user;

    // Use actual vendor data
    const displayVendor = vendor || { status: 'draft', compliance_score: 0, performance_score: 0 };

    const statusMessages = {
        draft: { title: 'Complete Your Profile', message: 'Your vendor profile is incomplete. Please complete the onboarding process.', action: 'Continue Onboarding', link: '/vendor/onboarding' },
        submitted: { title: 'Application Under Review', message: 'Your application has been submitted and is pending review by our operations team.', action: null },
        under_review: { title: 'Application Being Reviewed', message: 'Our team is currently reviewing your application and documents.', action: null },
        approved: { title: 'Application Approved!', message: 'Congratulations! Your vendor account has been approved. Awaiting activation.', action: null },
        active: { title: 'Account Active', message: 'Your vendor account is active. You can now submit payment requests.', action: null },
        suspended: { title: 'Account Suspended', message: 'Your account has been suspended. Please contact support.', action: null },
    };

    const currentStatus = statusMessages[displayVendor.status] || statusMessages.draft;

    const header = (
        <PageHeader 
            title="Dashboard"
            subtitle={`Welcome back, ${user?.name?.split(' ')[0]}!`}
            actions={
                <Badge status={displayVendor.status} size="lg" />
            }
        />
    );

    return (
        <VendorLayout 
            title="Vendor Dashboard" 
            activeNav="Dashboard" 
            header={header}
            vendor={displayVendor}
        >
            <div className="space-y-8">
                {/* Status Alert - Light Theme */}
                <div className={`bg-[var(--color-bg-primary)] border rounded-xl p-6 shadow-[var(--shadow-sm)] border-l-4 ${
                    displayVendor.status === 'active' ? 'border-l-[var(--color-success)]' :
                    displayVendor.status === 'suspended' ? 'border-l-[var(--color-danger)]' :
                    displayVendor.status === 'draft' ? 'border-l-[var(--color-text-muted)]' :
                    'border-l-[var(--color-warning)]'
                } border-[var(--color-border-primary)]`}>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{currentStatus.title}</h3>
                    <p className="text-[var(--color-text-tertiary)] mb-4">{currentStatus.message}</p>
                    {currentStatus.action && (
                        <Link href={currentStatus.link} className="btn-primary inline-flex items-center gap-2">
                            {currentStatus.action}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    )}
                </div>

                {/* Stats Cards */}
                {displayVendor.status !== 'draft' && (
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Compliance Score */}
                        <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-xl p-6 shadow-[var(--shadow-sm)]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg text-[var(--color-text-primary)]">Compliance</h3>
                                <span className="text-2xl">🛡️</span>
                            </div>
                            <div className={`text-4xl font-bold mb-2 ${
                                displayVendor.compliance_score >= 80 ? 'text-[var(--color-success)]' :
                                displayVendor.compliance_score >= 50 ? 'text-[var(--color-warning)]' :
                                'text-[var(--color-danger)]'
                            }`}>
                                {displayVendor.compliance_score || 0}%
                            </div>
                            <div className="w-full bg-[var(--color-bg-tertiary)] rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all ${
                                        displayVendor.compliance_score >= 80 ? 'bg-[var(--color-success)]' :
                                        displayVendor.compliance_score >= 50 ? 'bg-[var(--color-warning)]' :
                                        'bg-[var(--color-danger)]'
                                    }`}
                                    style={{ width: `${displayVendor.compliance_score || 0}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Performance Score */}
                        <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-xl p-6 shadow-[var(--shadow-sm)]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg text-[var(--color-text-primary)]">Performance</h3>
                                <span className="text-2xl">📈</span>
                            </div>
                            <div className="text-4xl font-bold mb-2 text-[var(--color-brand-primary)]">
                                {displayVendor.performance_score || 0}/100
                            </div>
                            <p className="text-sm text-[var(--color-text-tertiary)]">Based on delivery & quality metrics</p>
                        </div>

                        {/* Pending Payments */}
                        <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-xl p-6 shadow-[var(--shadow-sm)]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg text-[var(--color-text-primary)]">Pending Payments</h3>
                                <span className="text-2xl">💰</span>
                            </div>
                            <div className="text-4xl font-bold mb-2 text-[var(--color-text-primary)]">
                                ₹{Number(stats.pending_payments || 0).toLocaleString('en-IN')}
                            </div>
                            {displayVendor.status === 'active' && (
                                <Link href="/vendor/payments" className="btn-primary w-full mt-4 text-sm text-center block">
                                    Request Payment
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {/* Recent Documents */}
                {recentDocuments.length > 0 && (
                    <Card 
                        title="Recent Documents"
                        action={
                            <Link href="/vendor/documents" className="text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-hover)] text-sm font-medium">
                                View All →
                            </Link>
                        }
                    >
                        <div className="divide-y divide-[var(--color-border-secondary)]">
                            {recentDocuments.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-[var(--color-bg-hover)] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">📄</span>
                                        <div>
                                            <div className="text-[var(--color-text-primary)] text-sm font-medium">{doc.file_name}</div>
                                            <div className="text-xs text-[var(--color-text-tertiary)]">{doc.document_type?.display_name}</div>
                                        </div>
                                    </div>
                                    <Badge status={doc.verification_status} />
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </VendorLayout>
    );
}
