import { Link, router, usePage } from '@inertiajs/react';
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
    const [actionRole, setActionRole] = useState(null);
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [isMarkingPaid, setIsMarkingPaid] = useState(false);

    const [paymentRef, setPaymentRef] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');

    const handleApprove = (role) => {
        const route =
            role === 'ops'
                ? `/admin/payments/${payment.id}/validate-ops`
                : `/admin/payments/${payment.id}/approve-finance`;

        setIsApproving(true);
        router.post(
            route,
            { action: 'approve' },
            {
                onFinish: () => setIsApproving(false),
            }
        );
    };

    const handleReject = () => {
        const route =
            actionRole === 'ops'
                ? `/admin/payments/${payment.id}/validate-ops`
                : `/admin/payments/${payment.id}/approve-finance`;

        setIsRejecting(true);
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
                onFinish: () => setIsRejecting(false),
            }
        );
    };

    const handleMarkPaid = () => {
        setIsMarkingPaid(true);
        router.post(
            `/admin/payments/${payment.id}/mark-paid`,
            {
                payment_reference: paymentRef,
                payment_method: paymentMethod,
            },
            {
                onSuccess: () => setShowMarkPaidModal(false),
                onFinish: () => setIsMarkingPaid(false),
            }
        );
    };

    const openRejectModal = (role) => {
        setActionRole(role);
        setShowRejectModal(true);
    };

    const formatDateTime = (value) => {
        if (!value) {
            return '-';
        }

        return new Date(value).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatInrAmount = (value) => {
        const numericValue = Number.parseFloat(value);

        if (Number.isNaN(numericValue)) {
            return 'INR 0';
        }

        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(numericValue);
    };

    const isOpsStage = ['requested', 'pending_ops'].includes(payment.status);
    const isFinanceStage = payment.status === 'pending_finance';
    const vendorIsCompliant = payment.vendor?.compliance_status === 'compliant';
    const isFinanceApprovalBlocked =
        isFinanceStage && Boolean(payment.is_compliance_blocked) && !vendorIsCompliant;
    const canValidateOps = isOpsStage && can.validate_payments;
    const canApproveFinance = isFinanceStage && can.approve_payments && !isFinanceApprovalBlocked;
    const canRejectFinance = isFinanceStage && can.approve_payments;
    const canMarkAsPaid = payment.status === 'approved' && can.mark_paid;

    const header = (
        <PageHeader
            title={
                <span className="inline-flex min-w-0 max-w-full flex-wrap items-center gap-2">
                    <span>Payment</span>
                    <span className="max-w-full break-all rounded-lg bg-(--color-bg-secondary) px-2.5 py-1 text-sm font-semibold text-(--color-text-secondary)">
                        {payment.reference_number}
                    </span>
                </span>
            }
            subtitle="Payment request details"
            backLink="/admin/payments"
        />
    );

    return (
        <AdminLayout
            title={`Payment ${payment.reference_number}`}
            activeNav="Payments"
            header={header}
        >
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-2">
                    <Card>
                        <div className="p-6 space-y-6">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <h3 className="text-lg font-bold text-(--color-text-primary)">
                                    Request Details
                                </h3>
                                <Badge status={payment.status} />
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="rounded-xl bg-(--color-bg-secondary) px-4 py-3">
                                    <label className="text-xs uppercase tracking-wide text-(--color-text-muted)">
                                        Amount
                                    </label>
                                    <div className="mt-1 text-3xl font-bold tabular-nums text-(--color-text-primary)">
                                        {formatInrAmount(payment.amount)}
                                    </div>
                                </div>
                                <div className="rounded-xl bg-(--color-bg-secondary) px-4 py-3">
                                    <label className="text-xs uppercase tracking-wide text-(--color-text-muted)">
                                        Invoice Number
                                    </label>
                                    <div className="mt-1 break-all text-base font-mono text-(--color-text-primary)">
                                        {payment.invoice_number || 'N/A'}
                                    </div>
                                </div>

                                <div className="md:col-span-2 rounded-xl bg-(--color-bg-secondary) px-4 py-3">
                                    <label className="text-xs uppercase tracking-wide text-(--color-text-muted)">
                                        Description
                                    </label>
                                    <div className="mt-1 break-words text-(--color-text-primary)">
                                        {payment.description || 'No description provided.'}
                                    </div>
                                </div>

                                {payment.is_duplicate_flagged && (
                                    <div className="md:col-span-2 rounded-xl border border-(--color-warning) bg-(--color-warning-light) p-3 text-sm text-(--color-warning-dark)">
                                        Duplicate request pattern detected. Ops/Finance review is
                                        required before approval.
                                    </div>
                                )}

                                {payment.paid_date && (
                                    <>
                                        <div className="rounded-xl bg-(--color-bg-secondary) px-4 py-3">
                                            <label className="text-xs uppercase tracking-wide text-(--color-text-muted)">
                                                Paid Date
                                            </label>
                                            <div className="mt-1 text-(--color-text-primary)">
                                                {formatDateTime(payment.paid_date)}
                                            </div>
                                        </div>
                                        <div className="rounded-xl bg-(--color-bg-secondary) px-4 py-3">
                                            <label className="text-xs uppercase tracking-wide text-(--color-text-muted)">
                                                Payment Ref / Method
                                            </label>
                                            <div className="mt-1 break-all text-(--color-text-primary)">
                                                {payment.payment_reference || 'N/A'}{' '}
                                                <span className="text-(--color-text-tertiary)">
                                                    ({payment.payment_method || 'N/A'})
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card title="Approvals & History">
                        <div className="p-6">
                            <div className="relative ml-2 border-l border-(--color-border-primary)">
                                <div className="relative pb-6 pl-7">
                                    <div className="absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full border-2 border-(--color-brand-primary) bg-(--color-bg-primary)" />
                                    <div className="mb-1 text-sm text-(--color-text-tertiary)">
                                        {formatDateTime(payment.created_at)}
                                    </div>
                                    <div className="font-medium text-(--color-text-primary)">
                                        Request Created by {payment.requester?.name}
                                    </div>
                                </div>

                                {payment.approvals?.map((approval, index) => {
                                    const isLast = index === payment.approvals.length - 1;

                                    return (
                                        <div
                                            key={approval.id}
                                            className={`relative pl-7 ${isLast ? '' : 'pb-6'}`}
                                        >
                                            <div
                                                className={`absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full border-2 ${
                                                    approval.action === 'approved'
                                                        ? 'bg-(--color-success-light) border-(--color-success)'
                                                        : approval.action === 'rejected'
                                                          ? 'bg-(--color-danger-light) border-(--color-danger)'
                                                          : 'bg-(--color-bg-tertiary) border-(--color-border-hover)'
                                                }`}
                                            />
                                            <div className="mb-1 text-sm text-(--color-text-tertiary)">
                                                {formatDateTime(approval.updated_at)}
                                            </div>
                                            <div className="font-medium text-(--color-text-primary)">
                                                {approval.stage === 'ops_validation'
                                                    ? 'Ops Validation'
                                                    : 'Finance Approval'}
                                                {approval.user ? ` by ${approval.user.name}` : ''}
                                            </div>
                                            <div
                                                className={`mt-1 text-sm ${
                                                    approval.action === 'approved'
                                                        ? 'text-(--color-success)'
                                                        : approval.action === 'rejected'
                                                          ? 'text-(--color-danger)'
                                                          : 'text-(--color-text-tertiary)'
                                                }`}
                                            >
                                                {approval.action.charAt(0).toUpperCase() +
                                                    approval.action.slice(1)}
                                            </div>
                                            {approval.comment && (
                                                <div className="mt-2 rounded bg-(--color-bg-tertiary) p-2 text-sm text-(--color-text-secondary)">
                                                    "{approval.comment}"
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
                    <Card title="Actions">
                        <div className="space-y-3 p-5">
                            {canValidateOps && (
                                <>
                                    <p className="mb-2 text-xs uppercase tracking-wide text-(--color-text-muted)">
                                        Ops Validation Required
                                    </p>
                                    <Button
                                        variant="success"
                                        className="w-full justify-center py-2.5"
                                        disabled={isApproving || isRejecting || isMarkingPaid}
                                        onClick={() => handleApprove('ops')}
                                    >
                                        {isApproving ? 'Validating...' : 'Validate Request'}
                                    </Button>
                                    <Button
                                        variant="danger"
                                        className="w-full justify-center py-2.5"
                                        disabled={isApproving || isRejecting || isMarkingPaid}
                                        onClick={() => openRejectModal('ops')}
                                    >
                                        Reject Request
                                    </Button>
                                </>
                            )}

                            {canRejectFinance && (
                                <>
                                    <p className="mb-2 text-xs uppercase tracking-wide text-(--color-text-muted)">
                                        Finance Approval Required
                                    </p>
                                    {isFinanceApprovalBlocked ? (
                                        <div className="rounded-lg border border-(--color-danger) bg-(--color-danger-light) p-2 text-center text-sm text-(--color-danger-dark)">
                                            Approval blocked: vendor is non-compliant.
                                        </div>
                                    ) : (
                                        <Button
                                            variant="success"
                                            className="w-full justify-center py-2.5"
                                            disabled={isApproving || isRejecting || isMarkingPaid}
                                            onClick={() => handleApprove('finance')}
                                        >
                                            {isApproving ? 'Approving...' : 'Approve Payment'}
                                        </Button>
                                    )}
                                    <Button
                                        variant="danger"
                                        className="w-full justify-center py-2.5"
                                        disabled={isApproving || isRejecting || isMarkingPaid}
                                        onClick={() => openRejectModal('finance')}
                                    >
                                        Reject Payment
                                    </Button>
                                </>
                            )}

                            {canMarkAsPaid && (
                                <Button
                                    variant="primary"
                                    className="w-full justify-center py-2.5"
                                    disabled={isApproving || isRejecting || isMarkingPaid}
                                    onClick={() => setShowMarkPaidModal(true)}
                                >
                                    {isMarkingPaid ? 'Saving...' : 'Mark as Paid'}
                                </Button>
                            )}

                            {isOpsStage && !can.validate_payments && (
                                <div className="rounded-lg bg-(--color-bg-secondary) py-2 text-center text-(--color-text-tertiary)">
                                    Waiting for Ops Validation
                                </div>
                            )}
                            {isFinanceStage && !can.approve_payments && (
                                <div className="rounded-lg bg-(--color-bg-secondary) py-2 text-center text-(--color-text-tertiary)">
                                    Waiting for Finance Approval
                                </div>
                            )}
                            {payment.status === 'paid' && (
                                <div className="rounded-lg bg-(--color-success-light) py-2 text-center font-medium text-(--color-success-dark)">
                                    Payment Completed
                                </div>
                            )}

                            {!canValidateOps &&
                                !canApproveFinance &&
                                !canRejectFinance &&
                                !canMarkAsPaid &&
                                payment.status !== 'paid' && (
                                    <>
                                        <div className="rounded-lg bg-(--color-bg-secondary) py-2 text-center text-(--color-text-tertiary)">
                                            No action available for your role.
                                        </div>
                                    </>
                                )}
                        </div>
                    </Card>

                    <Card title="Vendor Information">
                        <div className="space-y-4 p-5">
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
                                <div className="break-all text-(--color-text-primary)">
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

            <Modal
                isOpen={showMarkPaidModal}
                onClose={() => setShowMarkPaidModal(false)}
                title="Mark Payment as Paid"
                footer={
                    <>
                        <ModalCancelButton onClick={() => setShowMarkPaidModal(false)} />
                        <ModalPrimaryButton
                            onClick={handleMarkPaid}
                            disabled={!paymentRef || isMarkingPaid}
                        >
                            {isMarkingPaid ? 'Saving...' : 'Confirm Payment'}
                        </ModalPrimaryButton>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor="payment_reference"
                            className="text-sm font-medium text-(--color-text-secondary) mb-2 block"
                        >
                            Payment Reference (UTR/Transaction ID) *
                        </label>
                        <input
                            id="payment_reference"
                            name="payment_reference"
                            type="text"
                            autoComplete="off"
                            value={paymentRef}
                            onChange={(e) => setPaymentRef(e.target.value)}
                            className="input-field w-full"
                            placeholder="e.g. UTR12345678..."
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="payment_method"
                            className="text-sm font-medium text-(--color-text-secondary) mb-2 block"
                        >
                            Payment Method
                        </label>
                        <select
                            id="payment_method"
                            name="payment_method"
                            autoComplete="off"
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

            <Modal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                title="Reject Payment Request"
                footer={
                    <>
                        <ModalCancelButton onClick={() => setShowRejectModal(false)} />
                        <Button
                            variant="danger"
                            onClick={handleReject}
                            disabled={!rejectReason || isRejecting}
                        >
                            {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
                        </Button>
                    </>
                }
            >
                <div>
                    <label
                        htmlFor="reject_reason"
                        className="text-sm font-medium text-(--color-text-secondary) mb-2 block"
                    >
                        Reason for Rejection *
                    </label>
                    <textarea
                        id="reject_reason"
                        name="reject_reason"
                        autoComplete="off"
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
