import { Link, router, usePage, useForm } from '@inertiajs/react';
import { AdminLayout, PageHeader, Card, Badge, Button, StatCard, StatGrid } from '@/Components';

export default function ComplianceRules({ rules = [] }) {
    const { auth } = usePage().props;
    const can = auth?.can || {};

    const updateRule = (ruleId, field, value) => {
        router.patch(`/admin/compliance/rules/${ruleId}`, { [field]: value }, { preserveScroll: true });
    };

    const header = (
        <PageHeader 
            title="Compliance Rules" 
            subtitle="Configure compliance evaluation rules"
            backLink="/admin/compliance"
        />
    );

    return (
        <AdminLayout title="Compliance Rules" activeNav="Compliance" header={header}>
            <div className="space-y-6">
                {rules.map((rule) => (
                    <Card key={rule.id}>
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] capitalize">{rule.name?.replace(/_/g, ' ')}</h3>
                                    <p className="text-sm text-[var(--color-text-tertiary)] mt-1">{rule.description}</p>
                                    <Badge status={rule.rule_type} className="mt-2" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-[var(--color-text-tertiary)]">Active</span>
                                    <button
                                        onClick={() => updateRule(rule.id, 'is_active', !rule.is_active)}
                                        disabled={!can.edit_rules}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${
                                            rule.is_active ? 'bg-[var(--color-success)]' : 'bg-[var(--color-bg-muted)]'
                                        } ${!can.edit_rules ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                            rule.is_active ? 'left-7' : 'left-1'
                                        }`} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 mt-4 p-4 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border-secondary)]">
                                <div>
                                    <label className="text-sm text-[var(--color-text-tertiary)] block mb-1 font-medium">Penalty Points</label>
                                    {can.edit_rules ? (
                                        <select
                                            value={rule.penalty_points}
                                            onChange={e => updateRule(rule.id, 'penalty_points', parseInt(e.target.value))}
                                            className="input-field w-full"
                                        >
                                            {[0, 1, 2, 3, 5, 10, 15, 20, 25].map(p => (
                                                <option key={p} value={p}>{p} points</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="text-[var(--color-text-primary)] font-medium">{rule.penalty_points} points</span>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm text-[var(--color-text-tertiary)] block mb-1 font-medium">Blocks Payments</label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={rule.blocks_payment}
                                            onChange={e => updateRule(rule.id, 'blocks_payment', e.target.checked)}
                                            disabled={!can.edit_rules}
                                            className="w-4 h-4 rounded border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                                        />
                                        <span className="text-[var(--color-text-primary)] text-sm">{rule.blocks_payment ? 'Yes' : 'No'}</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="text-sm text-[var(--color-text-tertiary)] block mb-1 font-medium">Blocks Activation</label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={rule.blocks_activation}
                                            onChange={e => updateRule(rule.id, 'blocks_activation', e.target.checked)}
                                            disabled={!can.edit_rules}
                                            className="w-4 h-4 rounded border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                                        />
                                        <span className="text-[var(--color-text-primary)] text-sm">{rule.blocks_activation ? 'Yes' : 'No'}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}

                {rules.length === 0 && (
                    <div className="glass-card p-12 text-center text-[var(--color-text-tertiary)]">
                        <span className="text-4xl block mb-4">📋</span>
                        No compliance rules configured
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
