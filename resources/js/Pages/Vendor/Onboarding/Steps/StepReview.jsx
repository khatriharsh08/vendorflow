import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';

export default function StepReview({ vendor, sessionData, documentTypes }) {
    const step1Session = sessionData?.step1 || {};
    const step2Session = sessionData?.step2 || {};
    const normalizeDocumentTypeId = (typeId) => String(typeId ?? '');
    const documentTypesById = useMemo(() => {
        const map = new Map();

        (Array.isArray(documentTypes) ? documentTypes : []).forEach((type) => {
            map.set(normalizeDocumentTypeId(type.id), type);
        });

        return map;
    }, [documentTypes]);

    const [processing, setProcessing] = useState(false);
    const submitApplication = () => {
        router.post(
            '/vendor/onboarding/submit',
            {},
            {
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
            }
        );
    };

    return (
        <div className="bg-(--color-bg-primary) border border-(--color-border-primary) rounded-2xl p-8 md:p-12 shadow-(--shadow-lg) animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-(--color-text-primary)">
                    Review & Submit
                </h1>
                <p className="text-(--color-text-tertiary)">
                    Please review your information before submitting.
                </p>
            </div>

            <div className="space-y-6">
                {/* Company Summary */}
                <div className="p-6 rounded-xl bg-(--color-bg-secondary) border border-(--color-border-secondary)">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-(--color-text-primary)">
                            <span>🏢</span> Company Details
                        </h3>
                        <button
                            onClick={() => router.get('/vendor/onboarding?step=1')}
                            className="text-(--color-brand-primary) hover:text-(--color-brand-primary-hover) text-sm font-medium"
                        >
                            Edit
                        </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-(--color-text-tertiary)">Company:</span>{' '}
                            <span className="text-(--color-text-primary) ml-2 font-medium">
                                {step1Session.company_name || vendor?.company_name}
                            </span>
                        </div>
                        <div>
                            <span className="text-(--color-text-tertiary)">PAN:</span>{' '}
                            <span className="text-(--color-text-primary) ml-2 font-medium">
                                {step1Session.pan_number || vendor?.pan_number}
                            </span>
                        </div>
                        <div>
                            <span className="text-(--color-text-tertiary)">GST:</span>{' '}
                            <span className="text-(--color-text-primary) ml-2 font-medium">
                                {step1Session.tax_id || vendor?.tax_id || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="text-(--color-text-tertiary)">Contact:</span>{' '}
                            <span className="text-(--color-text-primary) ml-2 font-medium">
                                {step1Session.contact_person || vendor?.contact_person}
                            </span>
                        </div>
                        <div>
                            <span className="text-(--color-text-tertiary)">Phone:</span>{' '}
                            <span className="text-(--color-text-primary) ml-2 font-medium">
                                {step1Session.contact_phone || vendor?.contact_phone}
                            </span>
                        </div>
                        <div>
                            <span className="text-(--color-text-tertiary)">City:</span>{' '}
                            <span className="text-(--color-text-primary) ml-2 font-medium">
                                {step1Session.city || vendor?.city}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bank Summary */}
                <div className="p-6 rounded-xl bg-(--color-bg-secondary) border border-(--color-border-secondary)">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-(--color-text-primary)">
                            <span>🏦</span> Bank Details
                        </h3>
                        <button
                            onClick={() => router.get('/vendor/onboarding?step=2')}
                            className="text-(--color-brand-primary) hover:text-(--color-brand-primary-hover) text-sm font-medium"
                        >
                            Edit
                        </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-(--color-text-tertiary)">Bank:</span>{' '}
                            <span className="text-(--color-text-primary) ml-2 font-medium">
                                {step2Session.bank_name || vendor?.bank_name}
                            </span>
                        </div>
                        <div>
                            <span className="text-(--color-text-tertiary)">Account:</span>{' '}
                            <span className="text-(--color-text-primary) ml-2 font-medium">
                                ****
                                {(
                                    step2Session.bank_account_number || vendor?.bank_account_number
                                )?.slice(-4)}
                            </span>
                        </div>
                        <div>
                            <span className="text-(--color-text-tertiary)">IFSC:</span>{' '}
                            <span className="text-(--color-text-primary) ml-2 font-medium">
                                {step2Session.bank_ifsc || vendor?.bank_ifsc}
                            </span>
                        </div>
                        <div>
                            <span className="text-(--color-text-tertiary)">Branch:</span>{' '}
                            <span className="text-(--color-text-primary) ml-2 font-medium">
                                {step2Session.bank_branch || vendor?.bank_branch || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Documents Summary */}
                <div className="p-6 rounded-xl bg-(--color-bg-secondary) border border-(--color-border-secondary)">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-(--color-text-primary)">
                            <span>📄</span> Documents
                        </h3>
                        <button
                            onClick={() => router.get('/vendor/onboarding?step=3')}
                            className="text-(--color-brand-primary) hover:text-(--color-brand-primary-hover) text-sm font-medium"
                        >
                            Edit
                        </button>
                    </div>
                    {sessionData?.step3?.documents?.length > 0 ? (
                        <div className="space-y-3">
                            {sessionData.step3.documents.map((doc, index) => {
                                const type = documentTypesById.get(
                                    normalizeDocumentTypeId(doc.document_type_id)
                                );
                                const displayName =
                                    type?.display_name ||
                                    doc?.document_type_name ||
                                    (doc?.file_name
                                        ? doc.file_name.replace(/\.[^/.]+$/, '')
                                        : 'Uploaded Document');
                                const fileSizeInBytes = Number(doc?.file_size || 0);
                                const fileSizeLabel =
                                    Number.isFinite(fileSizeInBytes) && fileSizeInBytes > 0
                                        ? `${(fileSizeInBytes / 1024).toFixed(1)} KB`
                                        : '-';

                                return (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 rounded-lg bg-(--color-bg-primary) border border-(--color-border-primary)"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-(--color-success-light) text-(--color-success) flex items-center justify-center">
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
                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-(--color-text-primary)">
                                                    {displayName}
                                                </p>
                                                <p className="text-xs text-(--color-text-tertiary)">
                                                    {doc.file_name}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded bg-(--color-bg-secondary) text-(--color-text-secondary)">
                                            {fileSizeLabel}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-sm text-(--color-danger) font-medium p-3 rounded-lg bg-(--color-danger)/10">
                            No documents uploaded yet.
                        </div>
                    )}
                </div>

                {/* Terms */}
                <div className="p-4 rounded-xl border border-(--color-warning) bg-(--color-warning-light)">
                    <p className="text-sm text-(--color-warning-dark)">
                        <strong>Important:</strong> By submitting this application, you confirm that
                        all information provided is accurate and complete. Your application will be
                        reviewed by our operations team.
                    </p>
                </div>
            </div>

            <div className="flex justify-between pt-8">
                <button
                    type="button"
                    onClick={() => router.get('/vendor/onboarding?step=3')}
                    className="px-6 py-3 rounded-xl border border-(--color-border-primary) text-(--color-text-secondary) hover:bg-(--color-bg-hover) transition-colors font-medium"
                >
                    ← Back
                </button>
                <button
                    onClick={submitApplication}
                    disabled={processing}
                    className="bg-linear-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/25 hover:-translate-y-px hover:shadow-indigo-500/40 transition-all flex items-center gap-2 text-lg px-8 py-3"
                >
                    {processing ? 'Submitting...' : 'Submit Application'}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
