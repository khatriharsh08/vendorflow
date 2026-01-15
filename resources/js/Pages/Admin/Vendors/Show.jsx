import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { AdminLayout, PageHeader, Card, Badge, Button, Modal, ModalCancelButton, ModalPrimaryButton, FormTextarea } from '@/Components';

export default function VendorShow({ vendor }) {
    const { auth } = usePage().props;
    const can = auth?.can || {};
    
    const [activeTab, setActiveTab] = useState('overview');
    const [showActionModal, setShowActionModal] = useState(null);

    const actionForm = useForm({ comment: '' });
    const notesForm = useForm({ internal_notes: vendor?.internal_notes || '' });

    const handleAction = (action) => {
        const routes = {
            approve: `/admin/vendors/${vendor.id}/approve`,
            reject: `/admin/vendors/${vendor.id}/reject`,
            activate: `/admin/vendors/${vendor.id}/activate`,
            suspend: `/admin/vendors/${vendor.id}/suspend`,
        };
        actionForm.post(routes[action], {
            onSuccess: () => { setShowActionModal(null); actionForm.reset(); },
        });
    };

    const saveNotes = (e) => {
        e.preventDefault();
        notesForm.post(`/admin/vendors/${vendor.id}/notes`);
    };

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'documents', label: 'Documents' },
        { id: 'compliance', label: 'Compliance' },
        { id: 'timeline', label: 'Timeline' },
        ...(can.edit_vendor_notes ? [{ id: 'notes', label: 'Internal Notes' }] : []),
    ];

    const canApprove = vendor?.status === 'submitted' || vendor?.status === 'under_review';
    const canReject = vendor?.status === 'submitted' || vendor?.status === 'under_review';
    const canActivate = vendor?.status === 'approved';
    const canSuspend = vendor?.status === 'active';

    const headerActions = (
        <div className="flex gap-2">
            {canApprove && <Button variant="success" onClick={() => setShowActionModal('approve')}>Approve</Button>}
            {canReject && <Button variant="danger" onClick={() => setShowActionModal('reject')}>Reject</Button>}
            {canActivate && <Button onClick={() => setShowActionModal('activate')}>Activate</Button>}
            {canSuspend && <Button variant="warning" onClick={() => setShowActionModal('suspend')}>Suspend</Button>}
        </div>
    );

    const header = (
        <PageHeader 
            title={
                <div className="flex items-center gap-3">
                    {vendor?.company_name}
                    <Badge status={vendor?.status} />
                </div>
            }
            subtitle={vendor?.contact_email}
            backLink="/admin/vendors"
            actions={headerActions}
        />
    );

    return (
        <AdminLayout title={vendor?.company_name || 'Vendor Details'} activeNav="Vendors" header={header}>
            {/* Tabs */}
            <div className="border-b border-(--color-border-secondary) -mx-8 px-8 mb-8">
                <div className="flex gap-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                                activeTab === tab.id ? 'border-indigo-500 text-(--color-text-primary)' : 'border-transparent text-(--color-text-secondary) hover:text-(--color-text-primary)'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="grid lg:grid-cols-2 gap-8">
                    <Card title="Company Information">
                        <div className="p-6 space-y-3 text-sm">
                            {[
                                ['Company Name', vendor?.company_name],
                                ['Registration No.', vendor?.registration_number || '-'],
                                ['PAN', vendor?.pan_number],
                                ['GST/Tax ID', vendor?.tax_id || '-'],
                                ['Business Type', vendor?.business_type || '-'],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between">
                                    <span className="text-(--color-text-secondary)">{label}</span>
                                    <span className="text-(--color-text-primary)">{value}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card title="Contact Information">
                        <div className="p-6 space-y-3 text-sm">
                            {[
                                ['Contact Person', vendor?.contact_person],
                                ['Email', vendor?.contact_email],
                                ['Phone', vendor?.contact_phone],
                                ['Address', `${vendor?.address}, ${vendor?.city}`],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between">
                                    <span className="text-(--color-text-secondary)">{label}</span>
                                    <span className="text-(--color-text-primary) text-right max-w-[200px]">{value}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card title="Bank Details">
                        <div className="p-6 space-y-3 text-sm">
                            {[
                                ['Bank Name', vendor?.bank_name],
                                ['Account No.', vendor?.bank_account_number],
                                ['IFSC', vendor?.bank_ifsc],
                                ['Branch', vendor?.bank_branch || '-'],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between">
                                    <span className="text-(--color-text-secondary)">{label}</span>
                                    <span className="text-(--color-text-primary)">{value}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card title="Scores & Status">
                        <div className="p-6 space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-(--color-text-secondary)">Performance Score</span><span className="text-(--color-text-primary) font-bold">{vendor?.performance_score || 0}</span></div>
                            <div className="flex justify-between"><span className="text-(--color-text-secondary)">Compliance Score</span><span className="text-(--color-text-primary) font-bold">{vendor?.compliance_score || 0}%</span></div>
                            <div className="flex justify-between items-center"><span className="text-(--color-text-secondary)">Compliance Status</span><Badge status={vendor?.compliance_status} /></div>
                            {can.rate_vendors && (
                                <Link href={`/admin/performance/${vendor?.id}/rate`} className="text-indigo-400 hover:text-indigo-300 text-sm block mt-4">
                                    Rate Performance →
                                </Link>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
                <Card>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-(--color-border-secondary)">
                                <th className="text-left p-4 text-sm font-medium text-(--color-text-secondary)">Document</th>
                                <th className="text-left p-4 text-sm font-medium text-(--color-text-secondary)">Status</th>
                                <th className="text-left p-4 text-sm font-medium text-(--color-text-secondary)">Expiry</th>
                                <th className="text-left p-4 text-sm font-medium text-(--color-text-secondary)">Uploaded</th>
                                {can.verify_documents && <th className="text-right p-4 text-sm font-medium text-(--color-text-secondary)">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {vendor?.documents?.map((doc) => (
                                <tr key={doc.id} className="border-b border-(--color-border-secondary)">
                                    <td className="p-4 text-(--color-text-primary)">{doc.document_type?.display_name}</td>
                                    <td className="p-4"><Badge status={doc.verification_status} /></td>
                                    <td className="p-4 text-(--color-text-secondary)">{doc.expiry_date || '-'}</td>
                                    <td className="p-4 text-(--color-text-secondary)">{doc.created_at}</td>
                                    {can.verify_documents && (
                                        <td className="p-4 text-right">
                                            {doc.verification_status === 'pending' && (
                                                <div className="flex gap-2 justify-end">
                                                    <Button variant="success" size="sm" onClick={() => router.post(`/admin/documents/${doc.id}/verify`)}>Verify</Button>
                                                    <Button variant="danger" size="sm" onClick={() => {
                                                        const reason = prompt('Rejection reason:');
                                                        if (reason) router.post(`/admin/documents/${doc.id}/reject`, { reason });
                                                    }}>Reject</Button>
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            {/* Compliance Tab */}
            {activeTab === 'compliance' && (
                <div className="space-y-4">
                    {can.run_compliance && (
                        <div className="flex justify-end">
                            <Button onClick={() => router.post(`/admin/compliance/evaluate/${vendor?.id}`)}>Run Evaluation</Button>
                        </div>
                    )}
                    {vendor?.compliance_results?.map((result) => (
                        <div key={result.id} className={`glass-card p-4 border-l-4 ${result.status === 'pass' ? 'border-l-green-500' : result.status === 'warning' ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-(--color-text-primary) font-medium">{result.rule?.name?.replace(/_/g, ' ')}</div>
                                    <div className="text-sm text-(--color-text-secondary)">{result.details}</div>
                                </div>
                                <Badge status={result.status} />
                            </div>
                        </div>
                    ))}
                    {(!vendor?.compliance_results || vendor.compliance_results.length === 0) && (
                        <div className="text-center text-(--color-text-secondary) py-8">No compliance results yet</div>
                    )}
                </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
                <Card>
                    <div className="p-6 space-y-0">
                        {vendor?.state_logs?.map((log, idx) => (
                            <div key={log.id} className="relative pl-8 pb-6 last:pb-0">
                                {idx < vendor.state_logs.length - 1 && <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-slate-700" />}
                                <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                </div>
                                <div className="bg-(--color-bg-secondary)/80 rounded-lg p-4 border border-(--color-border-secondary)">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-(--color-text-secondary)">{log.from_status}</span>
                                        <span className="text-slate-500">→</span>
                                        <span className="text-(--color-text-primary) font-medium">{log.to_status}</span>
                                    </div>
                                    <div className="text-xs text-slate-500">by {log.user?.name} • {log.created_at}</div>
                                    {log.comment && <div className="text-sm text-(--color-text-secondary) mt-2">{log.comment}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Internal Notes Tab */}
            {activeTab === 'notes' && can.edit_vendor_notes && (
                <Card title="Internal Notes">
                    <div className="p-6">
                        <p className="text-sm text-red-400 mb-4">⚠️ These notes are NOT visible to the vendor</p>
                        <form onSubmit={saveNotes}>
                            <textarea
                                value={notesForm.data.internal_notes}
                                onChange={e => notesForm.setData('internal_notes', e.target.value)}
                                className="input-field w-full h-48"
                                placeholder="Add internal notes about this vendor..."
                            />
                            <div className="flex justify-end mt-4">
                                <Button type="submit" disabled={notesForm.processing}>
                                    {notesForm.processing ? 'Saving...' : 'Save Notes'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>
            )}

            {/* Action Modal */}
            <Modal 
                isOpen={!!showActionModal} 
                onClose={() => setShowActionModal(null)}
                title={`${showActionModal} Vendor`}
                footer={
                    <>
                        <ModalCancelButton onClick={() => setShowActionModal(null)} />
                        <ModalPrimaryButton 
                            variant={showActionModal === 'approve' || showActionModal === 'activate' ? 'success' : 'danger'}
                            onClick={() => handleAction(showActionModal)}
                            disabled={actionForm.processing}
                        >
                            {actionForm.processing ? 'Processing...' : showActionModal}
                        </ModalPrimaryButton>
                    </>
                }
            >
                <FormTextarea
                    label={`Comment ${['reject', 'suspend'].includes(showActionModal) ? '*' : '(optional)'}`}
                    value={actionForm.data.comment}
                    onChange={(val) => actionForm.setData('comment', val)}
                    placeholder="Add a comment..."
                    required={['reject', 'suspend'].includes(showActionModal)}
                />
            </Modal>
        </AdminLayout>
    );
}
