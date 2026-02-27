import { useForm } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { VendorLayout, PageHeader, Card, Badge, Button, FormSelect } from '@/Components';
import { DocumentViewer } from '@/Components/DocumentViewer';

export default function Documents({ vendor, documents = [], documentTypes = [] }) {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showViewer, setShowViewer] = useState(false);
    const fileInputRef = useRef(null);

    const uploadForm = useForm({
        document_type_id: '',
        file: null,
    });

    const handleUpload = (e) => {
        e.preventDefault();
        uploadForm.post('/vendor/documents/upload', {
            onSuccess: () => {
                setShowUploadModal(false);
                uploadForm.reset();
            },
        });
    };

    // Use real documents from database
    const displayDocuments = documents;

    const header = (
        <PageHeader
            title="Documents"
            subtitle="Manage your uploaded documents"
            actions={
                <Button onClick={() => setShowUploadModal(true)}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    Upload Document
                </Button>
            }
        />
    );

    return (
        <VendorLayout title="Documents" activeNav="Documents" header={header} vendor={vendor}>
            <div className="space-y-8">
                {/* Document Stats - Light Theme */}
                <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-(--color-bg-primary) border border-(--color-border-primary) rounded-xl p-4 text-center shadow-(--shadow-sm)">
                        <div className="text-3xl mb-2">📄</div>
                        <div className="text-2xl font-bold text-(--color-text-primary)">
                            {displayDocuments.length}
                        </div>
                        <div className="text-sm text-(--color-text-tertiary)">Total Documents</div>
                    </div>
                    <div className="bg-(--color-bg-primary) border border-(--color-border-primary) rounded-xl p-4 text-center shadow-(--shadow-sm)">
                        <div className="text-3xl mb-2">✅</div>
                        <div className="text-2xl font-bold text-(--color-success)">
                            {
                                displayDocuments.filter((d) => d.verification_status === 'verified')
                                    .length
                            }
                        </div>
                        <div className="text-sm text-(--color-text-tertiary)">Verified</div>
                    </div>
                    <div className="bg-(--color-bg-primary) border border-(--color-border-primary) rounded-xl p-4 text-center shadow-(--shadow-sm)">
                        <div className="text-3xl mb-2">⏳</div>
                        <div className="text-2xl font-bold text-(--color-warning)">
                            {
                                displayDocuments.filter((d) => d.verification_status === 'pending')
                                    .length
                            }
                        </div>
                        <div className="text-sm text-(--color-text-tertiary)">Pending</div>
                    </div>
                    <div className="bg-(--color-bg-primary) border border-(--color-border-primary) rounded-xl p-4 text-center shadow-(--shadow-sm)">
                        <div className="text-3xl mb-2">❌</div>
                        <div className="text-2xl font-bold text-(--color-danger)">
                            {
                                displayDocuments.filter((d) => d.verification_status === 'rejected')
                                    .length
                            }
                        </div>
                        <div className="text-sm text-(--color-text-tertiary)">Rejected</div>
                    </div>
                </div>

                {/* Documents List */}
                <Card title={`All Documents (${displayDocuments.length})`}>
                    {displayDocuments.length === 0 ? (
                        <div className="p-8 text-center text-(--color-text-tertiary)">
                            <div className="text-4xl mb-4">📄</div>
                            <p>No documents uploaded yet.</p>
                        </div>
                    ) : (
                        <div className="max-h-[500px] overflow-y-auto divide-y divide-(--color-border-secondary)">
                            {displayDocuments.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-4 hover:bg-(--color-bg-hover) transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-(--color-bg-secondary) border border-(--color-border-secondary) flex items-center justify-center text-2xl">
                                            📄
                                        </div>
                                        <div>
                                            <div className="text-(--color-text-primary) font-medium">
                                                {doc.document_type?.display_name || 'Document'}
                                            </div>
                                            <div className="text-sm text-(--color-text-tertiary)">
                                                {doc.file_name}
                                            </div>
                                            <div className="text-xs text-(--color-text-muted) mt-0.5">
                                                Uploaded:{' '}
                                                {new Date(doc.created_at).toLocaleString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                setSelectedDocument(doc);
                                                setShowViewer(true);
                                            }}
                                            className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                                        >
                                            View
                                        </button>
                                        <a
                                            href={`/documents/${doc.id}/download`}
                                            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            Download
                                        </a>
                                        <Badge status={doc.verification_status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Upload Modal - Light Theme */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-(--color-bg-primary) border border-(--color-border-primary) rounded-2xl p-6 w-full max-w-md shadow-(--shadow-xl)">
                        <h3 className="text-xl font-bold text-(--color-text-primary) mb-4">
                            Upload Document
                        </h3>
                        <form onSubmit={handleUpload}>
                            <div className="space-y-4">
                                <FormSelect
                                    label="Document Type"
                                    value={uploadForm.data.document_type_id}
                                    onChange={(val) => uploadForm.setData('document_type_id', val)}
                                    options={documentTypes.map((type) => ({
                                        value: type.id,
                                        label: type.display_name,
                                    }))}
                                    placeholder="Select document type"
                                    required
                                />

                                <div>
                                    <label className="text-sm font-medium text-(--color-text-secondary) mb-2 block">
                                        File
                                    </label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={(e) =>
                                            uploadForm.setData('file', e.target.files[0])
                                        }
                                        className="w-full bg-(--color-bg-primary) border-2 border-(--color-border-primary) rounded-xl px-4 py-3 text-(--color-text-primary) file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-(--color-brand-primary)/10 file:text-(--color-brand-primary) hover:file:bg-(--color-brand-primary)/20 transition-all"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        required
                                    />
                                    <p className="text-xs text-(--color-text-muted) mt-1">
                                        PDF, JPG, PNG up to 10MB
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowUploadModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={uploadForm.processing}
                                    variant="primary"
                                >
                                    {uploadForm.processing ? 'Uploading...' : 'Upload'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Document Viewer Modal */}
            <DocumentViewer
                document={selectedDocument}
                isOpen={showViewer}
                onClose={() => {
                    setShowViewer(false);
                    setSelectedDocument(null);
                }}
            />
        </VendorLayout>
    );
}
