import { VendorLayout, PageHeader, Card, Badge } from '@/Components';

export default function Compliance({ vendor, complianceResults = [], rules = [] }) {
    const complianceScore = vendor?.compliance_score || 0;
    const passedRules = complianceResults.filter(r => r.status === 'pass').length;
    const failedRules = complianceResults.filter(r => r.status === 'fail').length;
    const pendingRules = rules.length - complianceResults.length;

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-[var(--color-success)]';
        if (score >= 50) return 'text-[var(--color-warning)]';
        return 'text-[var(--color-danger)]';
    };



    const header = (
        <PageHeader 
            title="Compliance"
            subtitle="View your compliance status and requirements"
            actions={
                <Badge 
                    status={vendor?.compliance_status || 'pending'} 
                    size="lg" 
                />
            }
        />
    );

    return (
        <VendorLayout title="Compliance" activeNav="Compliance" header={header} vendor={vendor}>
            <div className="space-y-8">
                {/* Compliance Score Card */}
                <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-2xl p-8 shadow-[var(--shadow-sm)]">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Score Circle */}
                        <div className="relative w-40 h-40 flex-shrink-0">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    cx="50" cy="50" r="45"
                                    fill="none"
                                    stroke="var(--color-border-secondary)"
                                    strokeWidth="8"
                                />
                                <circle
                                    cx="50" cy="50" r="45"
                                    fill="none"
                                    stroke={complianceScore >= 80 ? '#10b981' : complianceScore >= 50 ? '#f59e0b' : '#ef4444'}
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={`${complianceScore * 2.83} 283`}
                                    className="transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-4xl font-bold ${getScoreColor(complianceScore)}`}>
                                    {complianceScore}%
                                </span>
                            </div>
                        </div>

                        {/* Score Details */}
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                                Compliance Score
                            </h2>
                            <p className="text-[var(--color-text-tertiary)] mb-4">
                                {complianceScore >= 80 
                                    ? 'Excellent! Your compliance is in good standing.'
                                    : complianceScore >= 50 
                                    ? 'Needs attention. Please review failed requirements.'
                                    : 'Critical! Immediate action required.'}
                            </p>
                            <div className="flex justify-center md:justify-start gap-4">
                                <div className="text-center px-4 py-2 bg-emerald-50 rounded-lg">
                                    <div className="text-2xl font-bold text-emerald-600">{passedRules}</div>
                                    <div className="text-xs text-emerald-700">Passed</div>
                                </div>
                                <div className="text-center px-4 py-2 bg-red-50 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600">{failedRules}</div>
                                    <div className="text-xs text-red-700">Failed</div>
                                </div>
                                <div className="text-center px-4 py-2 bg-gray-50 rounded-lg">
                                    <div className="text-2xl font-bold text-gray-600">{pendingRules}</div>
                                    <div className="text-xs text-gray-700">Pending</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compliance Rules */}
                <Card title="Compliance Requirements">
                    <div className="divide-y divide-[var(--color-border-secondary)]">
                        {rules.length === 0 ? (
                            <div className="p-8 text-center text-[var(--color-text-tertiary)]">
                                <div className="text-4xl mb-4">🛡️</div>
                                <p>No compliance rules defined yet.</p>
                            </div>
                        ) : (
                            rules.map((rule, index) => {
                                const result = complianceResults.find(r => r.compliance_rule_id === rule.id);
                                const status = result?.status || 'pending';
                                
                                return (
                                    <div key={rule.id} className="p-4 hover:bg-[var(--color-bg-hover)] transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                                                status === 'pass' ? 'bg-emerald-100 text-emerald-600' :
                                                status === 'fail' ? 'bg-red-100 text-red-600' :
                                                'bg-gray-100 text-gray-500'
                                            }`}>
                                                {status === 'pass' ? '✓' : status === 'fail' ? '✗' : '○'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-[var(--color-text-primary)]">
                                                        {rule.name}
                                                    </h3>
                                                </div>
                                                <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
                                                    {rule.description}
                                                </p>
                                                {result?.details && (
                                                    <p className={`text-sm mt-2 ${
                                                        status === 'fail' ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'
                                                    }`}>
                                                        {result.details}
                                                    </p>
                                                )}
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                status === 'pass' ? 'bg-emerald-100 text-emerald-700' :
                                                status === 'fail' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                                {status === 'pass' ? 'Passed' : status === 'fail' ? 'Failed' : 'Pending'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>

                {/* Tips Card */}
                {failedRules > 0 && (
                    <Card title="How to Improve">
                        <div className="p-6">
                            <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <span className="text-2xl">💡</span>
                                <div>
                                    <h4 className="font-semibold text-amber-800 mb-2">
                                        Tips to improve your compliance score:
                                    </h4>
                                    <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                                        <li>Ensure all mandatory documents are uploaded and verified</li>
                                        <li>Keep your company registration and GST certificates up to date</li>
                                        <li>Maintain valid insurance coverage</li>
                                        <li>Complete all required agreements and contracts</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </VendorLayout>
    );
}
