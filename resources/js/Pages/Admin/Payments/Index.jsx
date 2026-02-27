import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    AdminLayout,
    PageHeader,
    DataTable,
    Badge,
    Button,
    Modal,
    ModalCancelButton,
    ModalPrimaryButton,
    StatCard,
    StatGrid,
} from '@/Components';

export default function PaymentsIndex({ payments, stats, currentStatus }) {
    const { auth } = usePage().props;
    const can = auth?.can || {};

    const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [paymentRef, setPaymentRef] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');

    const handleAction = (paymentId, stage, action) => {
        const route =
            stage === 'ops'
                ? `/admin/payments/${paymentId}/validate-ops`
                : `/admin/payments/${paymentId}/approve-finance`;

        if (action === 'reject') {
            const comment = window.prompt('Enter rejection reason:');
            if (!comment) {
                return;
            }

            router.post(route, { action, comment });

            return;
        }

        router.post(route, { action });
    };

    const handleMarkPaid = () => {
        router.post(
            `/admin/payments/${selectedPayment}/mark-paid`,
            {
                payment_reference: paymentRef,
                payment_method: paymentMethod,
            },
            {
                onSuccess: () => {
                    setShowMarkPaidModal(false);
                    setSelectedPayment(null);
                    setPaymentRef('');
                },
            }
        );
    };

    const statCards = [
        { label: 'Pending Requests', value: stats?.pending || 0, icon: '⏳', color: 'warning' },
        { label: 'Approved', value: stats?.approved || 0, icon: '✅', color: 'success' },
        {
            label: 'Total Paid',
            value: `₹${(stats?.paid || 0).toLocaleString('en-IN')}`,
            icon: '💰',
            color: 'primary',
        },
        { label: 'Total Transactions', value: stats?.total || 0, icon: '📋', color: 'info' },
    ];

    const columns = [
        {
            header: 'Reference',
            render: (row) => (
                <div className="space-y-1">
                    <div className="font-mono text-(--color-text-primary) font-medium">
                        {row.reference_number}
                    </div>
                    {row.is_duplicate_flagged && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-700">
                            Duplicate Flag
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: 'Vendor',
            render: (row) => (
                <span className="text-(--color-text-secondary)">{row.vendor?.company_name}</span>
            ),
        },
        {
            header: 'Amount',
            align: 'right',
            render: (row) => (
                <span className="text-(--color-text-primary) font-bold">
                    ₹{parseFloat(row.amount).toLocaleString('en-IN')}
                </span>
            ),
        },
        { header: 'Status', render: (row) => <Badge status={row.status} /> },
        {
            header: 'Actions',
            align: 'right',
            render: (row) => (
                <div className="flex gap-2 justify-end">
                    {['requested', 'pending_ops'].includes(row.status) && can.validate_payments && (
                        <>
                            <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleAction(row.id, 'ops', 'approve')}
                            >
                                Validate
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleAction(row.id, 'ops', 'reject')}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                    {row.status === 'pending_finance' && can.approve_payments && (
                        <>
                            <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleAction(row.id, 'finance', 'approve')}
                            >
                                Approve
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleAction(row.id, 'finance', 'reject')}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                    {row.status === 'approved' && can.mark_paid && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                                setSelectedPayment(row.id);
                                setShowMarkPaidModal(true);
                            }}
                        >
                            Mark Paid
                        </Button>
                    )}
                    {['requested', 'pending_ops'].includes(row.status) &&
                        !can.validate_payments && (
                            <span className="text-xs text-(--color-text-tertiary) italic">
                                Waiting for Ops
                            </span>
                        )}
                    {row.status === 'pending_finance' && !can.approve_payments && (
                        <span className="text-xs text-(--color-text-tertiary) italic">
                            Waiting for Finance
                        </span>
                    )}
                    {row.status === 'approved' && !can.mark_paid && (
                        <span className="text-xs text-(--color-text-tertiary) italic">
                            Ready for Payment
                        </span>
                    )}
                </div>
            ),
        },
    ];

    const statusFilters = [
        'all',
        'requested',
        'pending_ops',
        'pending_finance',
        'approved',
        'paid',
        'rejected',
    ];

    const header = (
        <PageHeader title="Payment Requests" subtitle="Manage vendor payment approvals" />
    );

    return (
        <AdminLayout title="Payment Requests" activeNav="Payments" header={header}>
            <div className="space-y-8">
                {/* Stats */}
                <StatGrid cols={6}>
                    {statCards.map((stat, idx) => (
                        <StatCard key={idx} {...stat} className="h-full" />
                    ))}
                </StatGrid>

                {/* Status Filters */}
                <div className="flex gap-2 flex-wrap p-1 bg-(--color-bg-tertiary) rounded-xl inline-flex">
                    {statusFilters.map((status) => (
                        <Link
                            key={status}
                            href={`/admin/payments?status=${status}`}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                currentStatus === status
                                    ? 'bg-(--color-bg-primary) text-(--color-text-primary) shadow-(--shadow-sm)'
                                    : 'text-(--color-text-tertiary) hover:text-(--color-text-primary) hover:bg-(--color-bg-primary)/50'
                            }`}
                        >
                            {status.replace('_', ' ').charAt(0).toUpperCase() +
                                status.replace('_', ' ').slice(1)}
                        </Link>
                    ))}
                </div>

                {/* Payments Table */}
                <DataTable
                    columns={columns}
                    data={payments?.data || []}
                    emptyMessage="No payment requests found"
                />
            </div>

            {/* Mark Paid Modal */}
            <Modal
                isOpen={showMarkPaidModal && can.mark_paid}
                onClose={() => setShowMarkPaidModal(false)}
                title="Mark as Paid"
                footer={
                    <>
                        <ModalCancelButton onClick={() => setShowMarkPaidModal(false)} />
                        <ModalPrimaryButton onClick={handleMarkPaid} disabled={!paymentRef}>
                            Confirm Payment
                        </ModalPrimaryButton>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-(--color-text-secondary) mb-2 block">
                            Payment Reference *
                        </label>
                        <input
                            type="text"
                            value={paymentRef}
                            onChange={(e) => setPaymentRef(e.target.value)}
                            className="input-field w-full"
                            placeholder="Transaction ID or UTR"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-(--color-text-secondary) mb-2 block">
                            Payment Method
                        </label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="input-field w-full"
                        >
                            <option value="">Select method</option>
                            <option value="NEFT">NEFT</option>
                            <option value="RTGS">RTGS</option>
                            <option value="IMPS">IMPS</option>
                            <option value="UPI">UPI</option>
                            <option value="Cheque">Cheque</option>
                        </select>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
