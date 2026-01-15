import { VendorLayout, PageHeader, Card } from '@/Components';

export default function Performance({ vendor, performanceScores = [], metrics = [] }) {
    const overallScore = vendor?.performance_score || 0;

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-600';
        if (score >= 60) return 'text-amber-600';
        return 'text-red-600';
    };

    const getScoreBgClass = (score) => {
        if (score >= 80) return 'bg-emerald-500';
        if (score >= 60) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const getScoreLabel = (score) => {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Very Good';
        if (score >= 70) return 'Good';
        if (score >= 60) return 'Average';
        if (score >= 50) return 'Below Average';
        return 'Needs Improvement';
    };

    const header = (
        <PageHeader 
            title="Performance"
            subtitle="Track your performance metrics and scores"
            actions={
                <div className={`px-4 py-2 rounded-xl font-semibold ${
                    overallScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                    overallScore >= 60 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                }`}>
                    {getScoreLabel(overallScore)}
                </div>
            }
        />
    );

    // Use only metrics from database
    const hasMetrics = metrics.length > 0;

    return (
        <VendorLayout title="Performance" activeNav="Performance" header={header} vendor={vendor}>
            <div className="space-y-8">
                {/* Overall Score Card */}
                <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-2xl overflow-hidden shadow-[var(--shadow-sm)]">
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            {/* Score Display */}
                            <div className="text-center">
                                <div className="text-7xl font-bold mb-2">{overallScore}</div>
                                <div className="text-lg opacity-90">out of 100</div>
                            </div>
                            
                            {/* Meter */}
                            <div className="flex-1 w-full max-w-md">
                                <div className="relative h-4 bg-white/20 rounded-full overflow-hidden">
                                    <div 
                                        className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-1000"
                                        style={{ width: `${overallScore}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-sm mt-2 opacity-75">
                                    <span>0</span>
                                    <span>25</span>
                                    <span>50</span>
                                    <span>75</span>
                                    <span>100</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Score Summary */}
                    <div className="p-6">
                        <p className="text-[var(--color-text-tertiary)]">
                            {overallScore >= 80 
                                ? 'Great job! Your performance is above average. Keep up the excellent work!'
                                : overallScore >= 60
                                ? 'Good performance. There is room for improvement in some areas.'
                                : 'Your performance needs attention. Please focus on improving the metrics below.'}
                        </p>
                    </div>
                </div>

                {/* Individual Metrics */}
                <Card title="Performance Metrics">
                    <div className="divide-y divide-[var(--color-border-secondary)]">
                        {!hasMetrics ? (
                            <div className="p-8 text-center text-[var(--color-text-tertiary)]">
                                <div className="text-4xl mb-4">📊</div>
                                <p>No performance metrics defined yet.</p>
                                <p className="text-sm mt-2">Performance metrics will appear here once configured by admin.</p>
                            </div>
                        ) : (
                            metrics.map((metric) => {
                                const scoreData = performanceScores.find(s => s.performance_metric_id === metric.id);
                                const score = scoreData?.score || 0;
                                
                                return (
                                    <div key={metric.id} className="p-4 hover:bg-[var(--color-bg-hover)] transition-colors">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h3 className="font-semibold text-[var(--color-text-primary)]">
                                                    {metric.display_name}
                                                </h3>
                                                <p className="text-sm text-[var(--color-text-tertiary)]">
                                                    {metric.description}
                                                </p>
                                            </div>
                                            <div className={`text-2xl font-bold ${score > 0 ? getScoreColor(score) : 'text-gray-400'}`}>
                                                {score > 0 ? score : 'N/A'}
                                            </div>
                                        </div>
                                        <div className="relative h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                                            <div 
                                                className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${score > 0 ? getScoreBgClass(score) : 'bg-gray-300'}`}
                                                style={{ width: `${score}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>

                {/* Performance History */}
                <Card title="Recent Performance">
                    <div className="p-6">
                        {performanceScores.length === 0 ? (
                            <div className="text-center text-[var(--color-text-tertiary)] py-8">
                                <div className="text-4xl mb-4">📈</div>
                                <p>No performance history available yet.</p>
                                <p className="text-sm mt-2">Performance scores will appear here once evaluated.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {performanceScores.slice(0, 5).map((score, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded-xl">
                                        <div>
                                            <div className="font-medium text-[var(--color-text-primary)]">
                                                {score.metric?.display_name || 'Performance Review'}
                                            </div>
                                            <div className="text-sm text-[var(--color-text-tertiary)]">
                                                {score.period_start && score.period_end 
                                                    ? `${new Date(score.period_start).toLocaleDateString()} - ${new Date(score.period_end).toLocaleDateString()}`
                                                    : 'Recent evaluation'}
                                            </div>
                                        </div>
                                        <div className={`text-xl font-bold ${getScoreColor(score.score)}`}>
                                            {score.score}/100
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Tips */}
                <Card title="Improve Your Score">
                    <div className="p-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                { icon: '⚡', title: 'Deliver on Time', desc: 'Meeting deadlines consistently improves your reliability score' },
                                { icon: '💬', title: 'Communicate Clearly', desc: 'Prompt and clear communication builds trust' },
                                { icon: '✅', title: 'Quality First', desc: 'High-quality work reduces revisions and increases satisfaction' },
                                { icon: '📋', title: 'Stay Compliant', desc: 'Keep all documents updated and follow policies' },
                            ].map((tip, index) => (
                                <div key={index} className="flex items-start gap-3 p-4 bg-[var(--color-bg-secondary)] rounded-xl">
                                    <span className="text-2xl">{tip.icon}</span>
                                    <div>
                                        <h4 className="font-semibold text-[var(--color-text-primary)]">{tip.title}</h4>
                                        <p className="text-sm text-[var(--color-text-tertiary)]">{tip.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </VendorLayout>
    );
}
