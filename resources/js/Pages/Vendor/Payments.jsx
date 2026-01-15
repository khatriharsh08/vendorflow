import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { VendorLayout, PageHeader, Card, Button } from '@/Components';

export default function Payments({ vendor, payments = { data: [] } }) {
    const [showRequestModal, setShowRequestModal] = useState(false);

    const requestForm = useForm({
        amount: '',
        invoice_number: '',
        description: '',
    });

    const handleSubmitRequest = (e) => {
        e.preventDefault();
        requestForm.post('/vendor/payments/request', {
            onSuccess: () => {
                setShowRequestModal(false);
                requestForm.reset();
            }
        });
    };

    const displayPayments = payments.data || [];

    const statusColors = {
        requested: 'bg-[var(--color-info-light)] text-[var(--color-info)]',
        pending_ops: 'bg-[var(--color-warning-light)] text-[var(--color-warning-dark)]',
        pending_finance: 'bg-amber-100 text-amber-700',
        approved: 'bg-[var(--color-success-light)] text-[var(--color-success)]',
        paid: 'bg-emerald-100 text-emerald-700',
        rejected: 'bg-[var(--color-danger-light)] text-[var(--color-danger)]',
        cancelled: 'bg-gray-100 text-gray-500',
    };

    const totalPending = displayPayments
        .filter(p => ['requested', 'pending_ops', 'pending_finance', 'approved'].includes(p.status))
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const totalPaid = displayPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const header = (
        <PageHeader 
            title="Payments"
            subtitle="Track and request payments"
            actions={
                vendor?.status === 'active' && (
                    <Button onClick={() => setShowRequestModal(true)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Request Payment
                    </Button>
                )
            }
        />
    );

    return (
        <VendorLayout 
            title="Payments" 
            activeNav="Payments" 
            header={header}
            vendor={vendor}
        >
            <div className="space-y-8">
                {/* Summary Cards - Light Theme */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-xl p-6 shadow-[var(--shadow-sm)]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[var(--color-text-tertiary)]">Pending Amount</span>
                            <span className="text-2xl">⏳</span>
                        </div>
                        <div className="text-3xl font-bold text-[var(--color-warning)]">
                            ₹{totalPending.toLocaleString('en-IN')}
                        </div>
                    </div>
                    <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-xl p-6 shadow-[var(--shadow-sm)]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[var(--color-text-tertiary)]">Total Paid</span>
                            <span className="text-2xl">✅</span>
                        </div>
                        <div className="text-3xl font-bold text-[var(--color-success)]">
                            ₹{totalPaid.toLocaleString('en-IN')}
                        </div>
                    </div>
                    <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-xl p-6 shadow-[var(--shadow-sm)]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[var(--color-text-tertiary)]">Total Requests</span>
                            <span className="text-2xl">📋</span>
                        </div>
                        <div className="text-3xl font-bold text-[var(--color-text-primary)]">
                            {displayPayments.length}
                        </div>
                    </div>
                </div>

                {/* Payments Table */}
                <Card title="Payment History">
                    {displayPayments.length === 0 ? (
                        <div className="p-8 text-center text-[var(--color-text-tertiary)]">
                            <div className="text-4xl mb-4">💰</div>
                            <p>No payment requests yet.</p>
                            {vendor?.status === 'active' && (
                                <Button onClick={() => setShowRequestModal(true)} className="mt-4">
                                    Request Your First Payment
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]">
                                        <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Reference</th>
                                        <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Description</th>
                                        <th className="text-right p-4 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Amount</th>
                                        <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Status</th>
                                        <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayPayments.map((payment) => (
                                        <tr key={payment.id} className="border-b border-[var(--color-border-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors">
                                            <td className="p-4">
                                                <span className="font-mono text-[var(--color-text-primary)] font-medium">{payment.reference_number || `PAY-${payment.id}`}</span>
                                            </td>
                                            <td className="p-4 text-[var(--color-text-secondary)]">{payment.description}</td>
                                            <td className="p-4 text-right">
                                                <span className="text-[var(--color-text-primary)] font-semibold">
                                                    ₹{(payment.amount || 0).toLocaleString('en-IN')}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[payment.status] || 'bg-gray-100 text-gray-500'}`}>
                                                    {payment.status?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4 text-[var(--color-text-tertiary)] text-sm">
                                                {new Date(payment.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>

            {/* Request Payment Modal - Light Theme */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-2xl p-6 w-full max-w-md shadow-[var(--shadow-xl)]">
                        <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">Request Payment</h3>
                        <form onSubmit={handleSubmitRequest}>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-2 block">Amount (₹) *</label>
                                    <input
                                        type="number"
                                        value={requestForm.data.amount}
                                        onChange={e => requestForm.setData('amount', e.target.value)}
                                        className="input-field w-full"
                                        placeholder="Enter amount"
                                        min="1"
                                        required
                                    />
                                    {requestForm.errors.amount && (
                                        <p className="text-sm text-[var(--color-danger)] mt-1">{requestForm.errors.amount}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-2 block">Invoice Number</label>
                                    <input
                                        type="text"
                                        value={requestForm.data.invoice_number}
                                        onChange={e => requestForm.setData('invoice_number', e.target.value)}
                                        className="input-field w-full"
                                        placeholder="INV-001"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-2 block">Description *</label>
                                    <textarea
                                        value={requestForm.data.description}
                                        onChange={e => requestForm.setData('description', e.target.value)}
                                        className="input-field w-full"
                                        rows="3"
                                        placeholder="Payment for services rendered..."
                                        required
                                    ></textarea>
                                    {requestForm.errors.description && (
                                        <p className="text-sm text-[var(--color-danger)] mt-1">{requestForm.errors.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setShowRequestModal(false)} 
                                    className="px-4 py-2 rounded-xl border border-[var(--color-border-primary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={requestForm.processing}
                                    className="btn-primary"
                                >
                                    {requestForm.processing ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </VendorLayout>
    );
}
