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
            },
        });
    };

    const displayPayments = payments.data || [];

    const statusColors = {
        requested: 'bg-(--color-info-light) text-(--color-info)',
        pending_ops: 'bg-(--color-warning-light) text-(--color-warning-dark)',
        pending_finance: 'bg-amber-100 text-amber-700',
        approved: 'bg-(--color-success-light) text-(--color-success)',
        paid: 'bg-emerald-100 text-emerald-700',
        rejected: 'bg-(--color-danger-light) text-(--color-danger)',
        cancelled: 'bg-gray-100 text-gray-500',
    };

    const totalPending = displayPayments
        .filter((p) =>
            ['requested', 'pending_ops', 'pending_finance', 'approved'].includes(p.status)
        )
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const totalPaid = displayPayments
        .filter((p) => p.status === 'paid')
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const header = (
        <PageHeader
            title="Payments"
            subtitle="Track and request payments"
            actions={
                vendor?.status === 'active' && (
                    <Button onClick={() => setShowRequestModal(true)}>
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        Request Payment
                    </Button>
                )
            }
        />
    );

    return (
        <VendorLayout title="Payments" activeNav="Payments" header={header} vendor={vendor}>
            <div className="space-y-8 animate-fade-in">
                {/* Summary Cards - Glass Theme */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-yellow-400/20"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <span className="text-sm font-medium text-slate-500">
                                Pending Amount
                            </span>
                            <div className="p-2 bg-yellow-50 rounded-lg">
                                <span className="text-xl">⏳</span>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-slate-800 relative z-10">
                            ₹{totalPending.toLocaleString('en-IN')}
                        </div>
                    </div>

                    <div className="glass-card p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-emerald-400/20"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <span className="text-sm font-medium text-slate-500">Total Paid</span>
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <span className="text-xl">✅</span>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-slate-800 relative z-10">
                            ₹{totalPaid.toLocaleString('en-IN')}
                        </div>
                    </div>

                    <div className="glass-card p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-indigo-400/20"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <span className="text-sm font-medium text-slate-500">
                                Total Requests
                            </span>
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <span className="text-xl">📋</span>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-slate-800 relative z-10">
                            {displayPayments.length}
                        </div>
                    </div>
                </div>

                {/* Payments Table */}
                <Card title="Payment History">
                    {displayPayments.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">💰</span>
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 mb-1">
                                No payment requests yet
                            </h3>
                            <p className="mb-6">
                                Create your first payment request to get started.
                            </p>
                            {vendor?.status === 'active' && (
                                <Button onClick={() => setShowRequestModal(true)}>
                                    Request Payment
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/50">
                                        <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Reference
                                        </th>
                                        <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="text-right p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {displayPayments.map((payment) => (
                                        <tr
                                            key={payment.id}
                                            className="hover:bg-slate-50/80 transition-colors"
                                        >
                                            <td className="p-4">
                                                <span className="font-mono text-sm text-slate-700 font-medium bg-slate-100 px-2 py-1 rounded">
                                                    {payment.reference_number ||
                                                        `PAY-${payment.id}`}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-600">
                                                {payment.description}
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className="text-slate-900 font-bold">
                                                    ₹{(payment.amount || 0).toLocaleString('en-IN')}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[payment.status] || 'bg-gray-100 text-gray-800'}`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusColors[payment.status]?.replace('bg-', 'bg-current ').replace('text-', 'text-') === 'bg-gray-100 text-gray-800' ? 'bg-gray-400' : 'bg-current'}`}
                                                    ></span>
                                                    {payment.status?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-500 text-sm">
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

            {/* Request Payment Modal - Premium */}
            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowRequestModal(false)}
                    />

                    <div className="relative glass-modal w-full max-w-lg rounded-2xl p-0 overflow-hidden shadow-2xl animate-scale-in">
                        <div className="p-6 border-b border-slate-100 bg-white/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">
                                        Request Payment
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Submit a new invoice for processing
                                    </p>
                                </div>
                                <div className="p-2 bg-indigo-50 rounded-full text-indigo-600">
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitRequest} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Amount (₹) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                                        ₹
                                    </span>
                                    <input
                                        type="number"
                                        value={requestForm.data.amount}
                                        onChange={(e) =>
                                            requestForm.setData('amount', e.target.value)
                                        }
                                        className="input-field w-full pl-8 font-medium text-lg"
                                        placeholder="0.00"
                                        min="1"
                                        required
                                        autoFocus
                                    />
                                </div>
                                {requestForm.errors.amount && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {requestForm.errors.amount}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Invoice Number
                                </label>
                                <input
                                    type="text"
                                    value={requestForm.data.invoice_number}
                                    onChange={(e) =>
                                        requestForm.setData('invoice_number', e.target.value)
                                    }
                                    className="input-field w-full"
                                    placeholder="INV-2024-001"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={requestForm.data.description}
                                    onChange={(e) =>
                                        requestForm.setData('description', e.target.value)
                                    }
                                    className="input-field w-full resize-none"
                                    rows="3"
                                    placeholder="Brief description of services or products..."
                                    required
                                ></textarea>
                                {requestForm.errors.description && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {requestForm.errors.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowRequestModal(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={requestForm.processing}
                                    className="flex-1 btn-primary py-2.5 text-base shadow-lg shadow-indigo-500/20"
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
