import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    AppIcon,
    Button,
    Card,
    FormInput,
    FormTextarea,
    PageHeader,
    VendorLayout,
} from '@/Components';

export default function Payments({ vendor, payments = { data: [] } }) {
    const [showRequestModal, setShowRequestModal] = useState(false);

    const requestForm = useForm({
        amount: '',
        invoice_number: '',
        description: '',
    });

    const handleSubmitRequest = (event) => {
        event.preventDefault();

        requestForm.post('/vendor/payments/request', {
            onSuccess: () => {
                setShowRequestModal(false);
                requestForm.reset();
            },
        });
    };

    const displayPayments = payments.data || [];

    const statusColors = {
        requested: 'bg-(--color-info-light) text-(--color-info-dark)',
        pending_ops: 'bg-(--color-warning-light) text-(--color-warning-dark)',
        pending_finance: 'bg-(--color-warning-light) text-(--color-warning-dark)',
        approved: 'bg-(--color-success-light) text-(--color-success-dark)',
        paid: 'bg-(--color-success) text-white',
        rejected: 'bg-(--color-danger-light) text-(--color-danger-dark)',
        cancelled: 'bg-(--color-bg-tertiary) text-(--color-text-tertiary)',
    };

    const totalPending = displayPayments
        .filter((payment) =>
            ['requested', 'pending_ops', 'pending_finance', 'approved'].includes(payment.status)
        )
        .reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);

    const totalPaid = displayPayments
        .filter((payment) => payment.status === 'paid')
        .reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);

    const header = (
        <PageHeader
            title="Payments"
            subtitle="Track and request payments"
            actions={
                ['active', 'approved'].includes(vendor?.status) && (
                    <Button onClick={() => setShowRequestModal(true)}>
                        <AppIcon name="payments" className="h-4 w-4" />
                        Request Payment
                    </Button>
                )
            }
        />
    );

    return (
        <VendorLayout title="Payments" activeNav="Payments" header={header} vendor={vendor}>
            <div className="space-y-8 animate-fade-in">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-(--color-bg-primary) rounded-2xl p-6 border border-(--color-warning-light) shadow-token-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-(--color-warning-light)/50 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-(--color-warning-light)/70" />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <span className="text-sm font-medium text-(--color-text-tertiary)">
                                Pending Amount
                            </span>
                            <span className="inline-flex p-2 bg-(--color-warning-light) rounded-lg text-(--color-warning-dark)">
                                <AppIcon name="clock" className="h-5 w-5" />
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-(--color-text-primary) relative z-10">
                            INR {totalPending.toLocaleString('en-IN')}
                        </div>
                    </div>

                    <div className="bg-(--color-bg-primary) rounded-2xl p-6 border border-(--color-success-light) shadow-token-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-(--color-success-light)/50 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-(--color-success-light)/70" />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <span className="text-sm font-medium text-(--color-text-tertiary)">
                                Total Paid
                            </span>
                            <span className="inline-flex p-2 bg-(--color-success-light) rounded-lg text-(--color-success-dark)">
                                <AppIcon name="success" className="h-5 w-5" />
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-(--color-text-primary) relative z-10">
                            INR {totalPaid.toLocaleString('en-IN')}
                        </div>
                    </div>

                    <div className="bg-(--color-bg-primary) rounded-2xl p-6 border border-(--color-brand-primary-light) shadow-token-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-(--color-brand-primary-light)/40 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-(--color-brand-primary-light)/60" />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <span className="text-sm font-medium text-(--color-text-tertiary)">
                                Total Requests
                            </span>
                            <span className="inline-flex p-2 bg-(--color-brand-primary-light) rounded-lg text-(--color-brand-primary-dark)">
                                <AppIcon name="reports" className="h-5 w-5" />
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-(--color-text-primary) relative z-10">
                            {displayPayments.length}
                        </div>
                    </div>
                </div>

                <Card title="Payment History">
                    {displayPayments.length === 0 ? (
                        <div className="p-12 text-center text-(--color-text-tertiary)">
                            <div className="w-16 h-16 bg-(--color-bg-secondary) rounded-full flex items-center justify-center mx-auto mb-4 text-(--color-brand-primary)">
                                <AppIcon name="payments" className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-medium text-(--color-text-primary) mb-1">
                                No payment requests yet
                            </h3>
                            <p className="mb-6">
                                Create your first payment request to get started.
                            </p>
                            {['active', 'approved'].includes(vendor?.status) && (
                                <Button onClick={() => setShowRequestModal(true)}>
                                    Request Payment
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-(--color-border-primary) bg-(--color-bg-secondary)/50">
                                        <th className="text-left p-4 text-xs font-semibold text-(--color-text-tertiary) uppercase tracking-wider">
                                            Reference
                                        </th>
                                        <th className="text-left p-4 text-xs font-semibold text-(--color-text-tertiary) uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="text-right p-4 text-xs font-semibold text-(--color-text-tertiary) uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="text-left p-4 text-xs font-semibold text-(--color-text-tertiary) uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="text-left p-4 text-xs font-semibold text-(--color-text-tertiary) uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-(--color-border-secondary)">
                                    {displayPayments.map((payment) => (
                                        <tr
                                            key={payment.id}
                                            className="hover:bg-(--color-bg-hover)/80 transition-colors"
                                        >
                                            <td className="p-4">
                                                <span className="font-mono text-sm text-(--color-text-secondary) font-medium bg-(--color-bg-tertiary) px-2 py-1 rounded">
                                                    {payment.reference_number ||
                                                        `PAY-${payment.id}`}
                                                </span>
                                            </td>
                                            <td className="p-4 text-(--color-text-secondary)">
                                                {payment.description}
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className="text-(--color-text-primary) font-bold">
                                                    INR{' '}
                                                    {(payment.amount || 0).toLocaleString('en-IN')}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[payment.status] || 'bg-(--color-bg-tertiary) text-(--color-text-primary)'}`}
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
                                                    {payment.status?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4 text-(--color-text-tertiary) text-sm">
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

            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-(--color-bg-secondary)/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowRequestModal(false)}
                        aria-hidden="true"
                    />

                    <div className="relative bg-(--color-bg-primary) w-full max-w-lg rounded-2xl p-0 overflow-hidden shadow-token-xl animate-scale-in border border-(--color-border-primary)">
                        <div className="p-6 border-b border-(--color-border-secondary) bg-(--color-bg-secondary)/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-(--color-text-primary)">
                                        Request Payment
                                    </h3>
                                    <p className="text-sm text-(--color-text-tertiary) mt-1">
                                        Submit a new invoice for processing
                                    </p>
                                </div>
                                <div className="p-2 bg-(--color-brand-primary-light) rounded-full text-(--color-brand-primary)">
                                    <AppIcon name="payments" className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitRequest} className="p-6 space-y-5">
                            {requestForm.errors.submit && (
                                <div className="bg-(--color-danger-light) border border-(--color-danger) text-(--color-danger-dark) px-4 py-3 rounded-xl text-sm font-medium">
                                    {requestForm.errors.submit}
                                </div>
                            )}

                            <FormInput
                                label="Amount (INR)"
                                type="number"
                                value={requestForm.data.amount}
                                onChange={(val) => requestForm.setData('amount', val)}
                                error={requestForm.errors.amount}
                                placeholder="0.00"
                                required
                                autoFocus
                            />

                            <FormInput
                                label="Invoice Number"
                                value={requestForm.data.invoice_number}
                                onChange={(val) => requestForm.setData('invoice_number', val)}
                                error={requestForm.errors.invoice_number}
                                placeholder="INV-2026-001"
                            />

                            <FormTextarea
                                label="Description"
                                value={requestForm.data.description}
                                onChange={(val) => requestForm.setData('description', val)}
                                error={requestForm.errors.description}
                                placeholder="Brief description of services or products..."
                                required
                                rows={3}
                            />

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowRequestModal(false)}
                                    className="flex-1 justify-center py-2.5"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={requestForm.processing}
                                    className="flex-1 justify-center py-2.5 text-base shadow-token-primary"
                                >
                                    {requestForm.processing ? 'Submitting...' : 'Submit Request'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </VendorLayout>
    );
}
