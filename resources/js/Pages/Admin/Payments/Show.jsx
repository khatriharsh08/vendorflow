import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    AdminLayout,
    PageHeader,
    Badge,
    Button,
    Card,
    Modal,
    ModalCancelButton,
    ModalPrimaryButton,
} from '@/Components';

export default function PaymentsShow({ payment }) {
    const { auth } = usePage().props;
    const can = auth?.can || {};

    const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [actionRole, setActionRole] = useState(null); // 'ops' or 'finance'

    // Payment specific state
    const [paymentRef, setPaymentRef] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');

    const handleApprove = (role) => {
        const route =
            role === 'ops'
                ? `/admin/payments/${payment.id}/validate-ops`
                : `/admin/payments/${payment.id}/approve-finance`;

        router.post(route, { action: 'approve' });
    };

    const handleReject = () => {
        const route =
            actionRole === 'ops'
                ? `/admin/payments/${payment.id}/validate-ops`
                : `/admin/payments/${payment.id}/approve-finance`;

        router.post(
            route,
            {
                action: 'reject',
                comment: rejectReason,
            },
            {
                onSuccess: () => {
                    setShowRejectModal(false);
                    setRejectReason('');
                },
            }
        );
    };

    const handleMarkPaid = () => {
        router.post(
            `/admin/payments/${payment.id}/mark-paid`,
            {
                payment_reference: paymentRef,
                payment_method: paymentMethod,
            },
            {
                onSuccess: () => setShowMarkPaidModal(false),
            }
        );
    };

    const openRejectModal = (role) => {
        setActionRole(role);
        setShowRejectModal(true);
    };

    const header = (
        <PageHeader
            title={`Payment ${payment.reference_number}`}
            subtitle="Payment Request Details"
            backUrl="/admin/payments"
        />
    );

    return (
        <AdminLayout
            title={`Payment ${payment.reference_number}`}
            activeNav="Payments"
            header={header}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Payment Details Card */}
                    <Card>
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-lg font-bold text-(--color-text-primary)">
                                Request Details
                            </h3>
                            <Badge status={payment.status} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm text-(--color-text-tertiary)">
                                    Amount
                                </label>
                                <div className="text-2xl font-bold text-(--color-text-primary)">
                                    ₹{parseFloat(payment.amount).toLocaleString('en-IN')}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-(--color-text-tertiary)">
                                    Invoice Number
                                </label>
                                <div className="text-lg font-mono text-(--color-text-primary)">
                                    {payment.invoice_number || 'N/A'}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm text-(--color-text-tertiary)">
                                    Description
                                </label>
                                <div className="text-(--color-text-primary) mt-1">
                                    {payment.description}
                                </div>
                            </div>
                            {payment.paid_date && (
                                <>
                                    <div>
                                        <label className="text-sm text-(--color-text-tertiary)">
                                            Paid Date
                                        </label>
                                        <div className="text-(--color-text-primary)">
                                            {new Date(payment.paid_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-(--color-text-tertiary)">
                                            Payment Ref / Method
                                        </label>
                                        <div className="text-(--color-text-primary)">
                                            {payment.payment_reference}{' '}
                                            <span className="text-(--color-text-tertiary)">
                                                ({payment.payment_method})
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>

                    {/* Timeline / Approvals */}
                    <Card title="Approvals & History">
                        <div className="space-y-6">
                            <div className="relative pl-6 border-l-2 border-(--color-border-primary)">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-(--color-bg-primary) border-2 border-(--color-brand-primary)"></div>
                                <div className="mb-1 text-sm text-(--color-text-tertiary)">
                                    {new Date(payment.created_at).toLocaleString()}
                                </div>
                                <div className="font-medium text-(--color-text-primary)">
                                    Request Created by {payment.requester?.name}
                                </div>
                            </div>

                            {payment.approvals?.map((approval) => (
                                <div
                                    key={approval.id}
                                    className="relative pl-6 border-l-2 border-(--color-border-primary)"
                                >
                                    <div
                                        className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${
                                            approval.action === 'approved'
                                                ? 'bg-green-100 border-green-500'
                                                : approval.action === 'rejected'
                                                  ? 'bg-red-100 border-red-500'
                                                  : 'bg-gray-100 border-gray-400'
                                        }`}
                                    ></div>
                                    <div className="mb-1 text-sm text-(--color-text-tertiary)">
                                        {new Date(approval.updated_at).toLocaleString()}
                                    </div>
                                    <div className="font-medium text-(--color-text-primary)">
                                        {approval.stage === 'ops_validation'
                                            ? 'Ops Validation'
                                            : 'Finance Approval'}
                                        {approval.user ? ` by ${approval.user.name}` : ''}
                                    </div>
                                    <div
                                        className={`text-sm mt-1 ${
                                            approval.action === 'approved'
                                                ? 'text-green-600'
                                                : approval.action === 'rejected'
                                                  ? 'text-red-600'
                                                  : 'text-gray-500'
                                        }`}
                                    >
                                        {approval.action.charAt(0).toUpperCase() +
                                            approval.action.slice(1)}
                                    </div>
                                    {approval.comment && (
                                        <div className="mt-2 text-sm bg-(--color-bg-tertiary) p-2 rounded text-(--color-text-secondary)">
                                            "{approval.comment}"
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Action Card */}
                    <Card title="Actions">
                        <div className="space-y-3">
                            {/* Ops Actions */}
                            {payment.status === 'requested' && can.validate_payments && (
                                <>
                                    <p className="text-sm text-(--color-text-tertiary) mb-2">
                                        Ops Validation Required
                                    </p>
                                    <Button
                                        variant="success"
                                        className="w-full justify-center"
                                        onClick={() => handleApprove('ops')}
                                    >
                                        Validate Request
                                    </Button>
                                    <Button
                                        variant="danger"
                                        className="w-full justify-center"
                                        onClick={() => openRejectModal('ops')}
                                    >
                                        Reject Request
                                    </Button>
                                </>
                            )}

                            {/* Finance Actions */}
                            {payment.status === 'pending_finance' && can.approve_payments && (
                                <>
                                    <p className="text-sm text-(--color-text-tertiary) mb-2">
                                        Finance Approval Required
                                    </p>
                                    <Button
                                        variant="success"
                                        className="w-full justify-center"
                                        onClick={() => handleApprove('finance')}
                                    >
                                        Approve Payment
                                    </Button>
                                    <Button
                                        variant="danger"
                                        className="w-full justify-center"
                                        onClick={() => openRejectModal('finance')}
                                    >
                                        Reject Payment
                                    </Button>
                                </>
                            )}

                            {/* Mark Paid Action */}
                            {payment.status === 'approved' && can.mark_paid && (
                                <Button
                                    variant="primary"
                                    className="w-full justify-center"
                                    onClick={() => setShowMarkPaidModal(true)}
                                >
                                    Mark as Paid
                                </Button>
                            )}

                            {/* Status Indicators if no action */}
                            {payment.status === 'requested' && !can.validate_payments && (
                                <div className="text-center text-(--color-text-tertiary) italic py-2">
                                    Waiting for Ops Validation
                                </div>
                            )}
                            {payment.status === 'pending_finance' && !can.approve_payments && (
                                <div className="text-center text-(--color-text-tertiary) italic py-2">
                                    Waiting for Finance Approval
                                </div>
                            )}
                            {payment.status === 'paid' && (
                                <div className="text-center text-green-600 font-medium py-2">
                                    Payment Completed
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Vendor Info Card */}
                    <Card title="Vendor Information">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-(--color-text-tertiary)">
                                    Company
                                </label>
                                <div className="font-medium text-(--color-text-primary)">
                                    <Link
                                        href={`/admin/vendors/${payment.vendor.id}`}
                                        className="hover:text-(--color-brand-primary) underline-offset-2 hover:underline"
                                    >
                                        {payment.vendor.company_name}
                                    </Link>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-(--color-text-tertiary)">
                                    Contact Person
                                </label>
                                <div className="text-(--color-text-primary)">
                                    {payment.vendor.contact_person}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-(--color-text-tertiary)">
                                    Email
                                </label>
                                <div className="text-(--color-text-primary)">
                                    {payment.vendor.contact_email}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-(--color-text-tertiary)">
                                    Compliance Status
                                </label>
                                <div className="mt-1">
                                    <Badge status={payment.vendor.compliance_status} />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Mark Paid Modal */}
            <Modal
                isOpen={showMarkPaidModal}
                onClose={() => setShowMarkPaidModal(false)}
                title="Mark Payment as Paid"
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
                            Payment Reference (UTR/Transaction ID) *
                        </label>
                        <input
                            type="text"
                            value={paymentRef}
                            onChange={(e) => setPaymentRef(e.target.value)}
                            className="input-field w-full"
                            placeholder="e.g. UTR12345678"
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
                            <option value="">Select Method...</option>
                            <option value="NEFT">NEFT</option>
                            <option value="RTGS">RTGS</option>
                            <option value="IMPS">IMPS</option>
                            <option value="UPI">UPI</option>
                            <option value="Wire Transfer">Wire Transfer</option>
                            <option value="Cheque">Cheque</option>
                        </select>
                    </div>
                </div>
            </Modal>

            {/* Reject Modal */}
            <Modal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                title={`Reject Payment Request`}
                footer={
                    <>
                        <ModalCancelButton onClick={() => setShowRejectModal(false)} />
                        <Button variant="danger" onClick={handleReject} disabled={!rejectReason}>
                            Confirm Rejection
                        </Button>
                    </>
                }
            >
                <div>
                    <label className="text-sm font-medium text-(--color-text-secondary) mb-2 block">
                        Reason for Rejection *
                    </label>
                    <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="input-field w-full h-32"
                        placeholder="Please provide a reason for rejecting this payment request..."
                    ></textarea>
                </div>
            </Modal>
        </AdminLayout>
    );
}
