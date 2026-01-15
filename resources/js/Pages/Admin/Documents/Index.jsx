import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { AdminLayout, PageHeader, DataTable, Badge, Button, Modal, ModalCancelButton, ModalPrimaryButton, FormTextarea } from '@/Components';

export default function DocumentsIndex({ documents }) {
    const { auth } = usePage().props;
    const can = auth?.can || {};
    
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const verifyDocument = (docId) => {
        router.post(`/admin/documents/${docId}/verify`, {}, { preserveScroll: true });
    };

    const rejectDocument = () => {
        router.post(`/admin/documents/${selectedDoc}/reject`, { reason: rejectReason }, {
            onSuccess: () => {
                setShowRejectModal(false);
                setSelectedDoc(null);
                setRejectReason('');
            },
            preserveScroll: true,
        });
    };

    const columns = [
        { header: 'Vendor', render: (row) => <span className="text-(--color-text-primary) font-medium">{row.vendor?.company_name}</span> },
        { header: 'Document Type', render: (row) => <span className="text-(--color-text-secondary)">{row.document_type?.display_name}</span> },
        { 
            header: 'File', 
            render: (row) => (
                <a href={`/admin/documents/${row.id}/download`} className="text-(--color-brand-primary) hover:underline" target="_blank">
                    {row.file_name}
                </a>
            )
        },
        { header: 'Uploaded', render: (row) => <span className="text-(--color-text-tertiary) text-sm">{row.created_at}</span> },
    ];

    // Add actions column only if user has permission
    if (can.verify_documents) {
        columns.push({
            header: 'Actions',
            align: 'right',
            render: (row) => (
                <div className="flex gap-2 justify-end">
                    <Button variant="success" size="sm" onClick={() => verifyDocument(row.id)}>✓ Verify</Button>
                    <Button variant="danger" size="sm" onClick={() => { setSelectedDoc(row.id); setShowRejectModal(true); }}>✗ Reject</Button>
                </div>
            )
        });
    }

    const header = (
        <PageHeader title="Document Verification" subtitle="Review and verify vendor documents" />
    );

    return (
        <AdminLayout title="Document Verification" activeNav="Documents" header={header}>
            <DataTable 
                columns={columns} 
                data={documents?.data || []} 
                emptyIcon="✅"
                emptyMessage="All documents have been verified!"
            />

            {/* Reject Modal */}
            <Modal 
                isOpen={showRejectModal && can.reject_documents} 
                onClose={() => setShowRejectModal(false)}
                title="Reject Document"
                footer={
                    <>
                        <ModalCancelButton onClick={() => setShowRejectModal(false)} />
                        <ModalPrimaryButton variant="danger" onClick={rejectDocument} disabled={!rejectReason}>
                            Reject Document
                        </ModalPrimaryButton>
                    </>
                }
            >
                <FormTextarea
                    label="Reason for Rejection"
                    value={rejectReason}
                    onChange={setRejectReason}
                    placeholder="Please provide a reason for rejection..."
                    required
                />
            </Modal>
        </AdminLayout>
    );
}
