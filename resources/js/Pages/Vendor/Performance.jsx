import { AppIcon, Card, PageHeader, VendorLayout } from '@/Components';

export default function Performance({ vendor, performanceScores = [], metrics = [] }) {
    const overallScore = Number(vendor?.performance_score || 0);

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-(--color-success)';
        if (score >= 60) return 'text-(--color-warning)';
        return 'text-(--color-danger)';
    };

    const getScoreBgClass = (score) => {
        if (score >= 80) return 'bg-(--color-success)';
        if (score >= 60) return 'bg-(--color-warning)';
        return 'bg-(--color-danger)';
    };

    const getScoreLabel = (score) => {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Very Good';
        if (score >= 70) return 'Good';
        if (score >= 60) return 'Average';
        if (score >= 50) return 'Below Average';
        return 'Needs Improvement';
    };

    const toPercentage = (value, max) =>
        Math.round((Number(value || 0) / Math.max(1, Number(max || 1))) * 100);

    const header = (
        <PageHeader
            title="Performance"
            subtitle="Track your performance metrics and scores"
            actions={
                <div
                    className={`px-4 py-2 rounded-xl font-semibold ${
                        overallScore >= 80
                            ? 'bg-(--color-success-light) text-(--color-success-dark)'
                            : overallScore >= 60
                              ? 'bg-(--color-warning-light) text-(--color-warning-dark)'
                              : 'bg-(--color-danger-light) text-(--color-danger-dark)'
                    }`}
                >
                    {getScoreLabel(overallScore)}
                </div>
            }
        />
    );

    const hasMetrics = metrics.length > 0;

    return (
        <VendorLayout title="Performance" activeNav="Performance" header={header} vendor={vendor}>
            <div className="space-y-8">
                <div className="bg-(--color-bg-primary) border border-(--color-border-primary) rounded-2xl overflow-hidden shadow-token-sm">
                    <div className="bg-gradient-primary p-8 text-white">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="text-center">
                                <div className="text-7xl font-bold mb-2">{overallScore}</div>
                                <div className="text-lg opacity-90">out of 100</div>
                            </div>

                            <div className="flex-1 w-full max-w-md">
                                <div className="relative h-4 bg-(--color-bg-primary)/20 rounded-full overflow-hidden">
                                    <div
                                        className="absolute left-0 top-0 h-full bg-(--color-bg-primary) rounded-full transition-all duration-1000"
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

                    <div className="p-6">
                        <p className="text-(--color-text-tertiary)">
                            {overallScore >= 80
                                ? 'Great job. Your performance is above average.'
                                : overallScore >= 60
                                  ? 'Good performance. There is room for improvement in some areas.'
                                  : 'Your performance needs attention. Focus on improving the metrics below.'}
                        </p>
                    </div>
                </div>

                <Card title="Performance Metrics">
                    <div className="divide-y divide-(--color-border-secondary)">
                        {!hasMetrics ? (
                            <div className="p-8 text-center text-(--color-text-tertiary)">
                                <div className="text-4xl mb-4 inline-flex justify-center w-full">
                                    <AppIcon name="metrics" className="h-10 w-10" />
                                </div>
                                <p>No performance metrics defined yet.</p>
                                <p className="text-sm mt-2">
                                    Performance metrics will appear here once configured by admin.
                                </p>
                            </div>
                        ) : (
                            metrics.map((metric) => {
                                const scoreData = performanceScores.find(
                                    (s) => s.performance_metric_id === metric.id
                                );
                                const maxScore = Number(metric.max_score || 10);
                                const score = Number(scoreData?.score || 0);
                                const scorePercentage = toPercentage(score, maxScore);

                                return (
                                    <div
                                        key={metric.id}
                                        className="p-4 hover:bg-(--color-bg-hover) transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h3 className="font-semibold text-(--color-text-primary)">
                                                    {metric.display_name}
                                                </h3>
                                                <p className="text-sm text-(--color-text-tertiary)">
                                                    {metric.description}
                                                </p>
                                            </div>
                                            <div
                                                className={`text-2xl font-bold ${score > 0 ? getScoreColor(scorePercentage) : 'text-(--color-text-muted)'}`}
                                            >
                                                {score > 0 ? `${score}/${maxScore}` : 'N/A'}
                                            </div>
                                        </div>
                                        <div className="relative h-2 bg-(--color-bg-tertiary) rounded-full overflow-hidden">
                                            <div
                                                className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${score > 0 ? getScoreBgClass(scorePercentage) : 'bg-(--color-bg-muted)'}`}
                                                style={{ width: `${scorePercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>

                <Card title="Recent Performance">
                    <div className="p-6">
                        {performanceScores.length === 0 ? (
                            <div className="text-center text-(--color-text-tertiary) py-8">
                                <div className="text-4xl mb-4 inline-flex justify-center w-full">
                                    <AppIcon name="trend" className="h-10 w-10" />
                                </div>
                                <p>No performance history available yet.</p>
                                <p className="text-sm mt-2">
                                    Performance scores will appear here once evaluated.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {performanceScores.slice(0, 5).map((score) => {
                                    const maxScore = Number(score.metric?.max_score || 100);
                                    const normalizedScore = toPercentage(score.score, maxScore);

                                    return (
                                        <div
                                            key={score.id}
                                            className="flex items-center justify-between p-3 bg-(--color-bg-secondary) rounded-xl"
                                        >
                                            <div>
                                                <div className="font-medium text-(--color-text-primary)">
                                                    {score.metric?.display_name ||
                                                        'Performance Review'}
                                                </div>
                                                <div className="text-sm text-(--color-text-tertiary)">
                                                    {score.period_start && score.period_end
                                                        ? `${new Date(score.period_start).toLocaleDateString()} - ${new Date(score.period_end).toLocaleDateString()}`
                                                        : 'Recent evaluation'}
                                                </div>
                                            </div>
                                            <div
                                                className={`text-xl font-bold ${getScoreColor(normalizedScore)}`}
                                            >
                                                {score.score}/{maxScore}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </Card>

                <Card title="Improve Your Score">
                    <div className="p-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                {
                                    icon: 'running',
                                    title: 'Deliver on Time',
                                    desc: 'Meeting deadlines consistently improves your reliability score',
                                },
                                {
                                    icon: 'messages',
                                    title: 'Communicate Clearly',
                                    desc: 'Prompt and clear communication builds trust',
                                },
                                {
                                    icon: 'success',
                                    title: 'Quality First',
                                    desc: 'High-quality work reduces revisions and increases satisfaction',
                                },
                                {
                                    icon: 'reports',
                                    title: 'Stay Compliant',
                                    desc: 'Keep all documents updated and follow policies',
                                },
                            ].map((tip, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-4 bg-(--color-bg-secondary) rounded-xl"
                                >
                                    <span className="text-2xl inline-flex">
                                        <AppIcon name={tip.icon} className="h-6 w-6" />
                                    </span>
                                    <div>
                                        <h4 className="font-semibold text-(--color-text-primary)">
                                            {tip.title}
                                        </h4>
                                        <p className="text-sm text-(--color-text-tertiary)">
                                            {tip.desc}
                                        </p>
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
