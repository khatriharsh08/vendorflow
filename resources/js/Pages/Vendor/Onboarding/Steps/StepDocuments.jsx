import { useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';

export default function StepDocuments({ documentTypes, sessionData }) {
    const [uploadedDocs, setUploadedDocs] = useState([]);
    const [processing, setProcessing] = useState(false);
    const sessionDocs = useMemo(() => sessionData?.step3?.documents || [], [sessionData]);
    const normalizeTypeId = (typeId) => String(typeId ?? '');

    const sessionDocsByType = useMemo(() => {
        const docsMap = new Map();

        (Array.isArray(sessionDocs) ? sessionDocs : []).forEach((doc) => {
            docsMap.set(normalizeTypeId(doc.document_type_id), doc);
        });

        return docsMap;
    }, [sessionDocs]);

    const handleFileUpload = (typeId, file) => {
        const normalizedTypeId = normalizeTypeId(typeId);

        setUploadedDocs((prev) => {
            const filtered = prev.filter((d) => d.typeId !== normalizedTypeId);
            return [...filtered, { typeId: normalizedTypeId, file, name: file.name }];
        });
    };

    const submit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        uploadedDocs.forEach((doc, index) => {
            formData.append(`documents[${index}][document_type_id]`, doc.typeId);
            formData.append(`documents[${index}][file]`, doc.file);
        });
        router.post('/vendor/onboarding/step3', formData, {
            forceFormData: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });
    };

    const viewDocument = (typeId) => {
        const normalizedTypeId = normalizeTypeId(typeId);
        const uploaded = uploadedDocs.find((d) => d.typeId === normalizedTypeId);
        if (uploaded) {
            const url = URL.createObjectURL(uploaded.file);
            window.open(url, '_blank');
        } else {
            const sessionDoc = sessionDocsByType.get(normalizedTypeId);
            if (sessionDoc) {
                window.open(`/vendor/onboarding/document/${sessionDoc.document_type_id}`, '_blank');
            }
        }
    };

    const { props } = usePage();
    const errors = props.errors || {};

    const getFileError = (index) => {
        return errors[`documents.${index}.file`] || errors[`documents.${index}.document_type_id`];
    };

    return (
        <div className="bg-(--color-bg-primary) border border-(--color-border-primary) rounded-2xl p-8 md:p-12 shadow-(--shadow-lg) animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-(--color-text-primary)">
                    Upload Documents
                </h1>
                <p className="text-(--color-text-tertiary)">
                    Upload required documents for verification. Files marked with * are mandatory.
                </p>
                {errors.documents && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {errors.documents}
                    </div>
                )}
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div className="grid gap-4">
                    {(!documentTypes || documentTypes.length === 0) && (
                        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm">
                            No document types are configured yet. Please contact admin to set up
                            required onboarding documents.
                        </div>
                    )}

                    {documentTypes?.map((docType) => {
                        const normalizedTypeId = normalizeTypeId(docType.id);
                        const uploadedDoc =
                            uploadedDocs.find((d) => d.typeId === normalizedTypeId) || null;
                        const uploadedIndex = uploadedDocs.findIndex(
                            (d) => d.typeId === normalizedTypeId
                        );
                        const sessionDoc = sessionDocsByType.get(normalizedTypeId);
                        const hasUploadedDoc = Boolean(uploadedDoc || sessionDoc);
                        const error = uploadedIndex !== -1 ? getFileError(uploadedIndex) : null;

                        return (
                            <div
                                key={docType.id}
                                className={`p-4 rounded-xl border transition-all ${
                                    hasUploadedDoc
                                        ? 'border-(--color-success) bg-(--color-success-light)'
                                        : 'border-(--color-border-primary) bg-(--color-bg-secondary)'
                                } ${error ? 'border-(--color-danger) bg-red-50' : ''}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-(--color-text-primary)">
                                            {docType.display_name}
                                            {docType.is_mandatory && (
                                                <span className="text-(--color-danger) ml-1">
                                                    *
                                                </span>
                                            )}
                                        </div>
                                        {docType.description && (
                                            <p className="text-sm text-(--color-text-tertiary) mt-1">
                                                {docType.description}
                                            </p>
                                        )}
                                        {hasUploadedDoc && (
                                            <p className="text-sm text-(--color-success) mt-2 flex items-center gap-1">
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                {uploadedDoc?.name || sessionDoc?.file_name}
                                            </p>
                                        )}
                                        {error && (
                                            <p className="text-sm text-(--color-danger) mt-1">
                                                {error}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {hasUploadedDoc && (
                                            <button
                                                type="button"
                                                onClick={() => viewDocument(docType.id)}
                                                className="px-4 py-2 rounded-lg bg-(--color-bg-secondary) border border-(--color-border-primary) hover:bg-(--color-bg-hover) text-(--color-text-primary) text-sm font-medium transition-colors"
                                            >
                                                View
                                            </button>
                                        )}
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => {
                                                    if (e.target.files[0])
                                                        handleFileUpload(
                                                            normalizedTypeId,
                                                            e.target.files[0]
                                                        );
                                                }}
                                            />
                                            <span className="px-4 py-2 rounded-lg bg-(--color-bg-primary) border border-(--color-border-primary) hover:border-(--color-brand-primary) text-(--color-text-secondary) text-sm font-medium transition-colors">
                                                {hasUploadedDoc ? 'Replace' : 'Upload'}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-between pt-4">
                    <button
                        type="button"
                        onClick={() => router.get('/vendor/onboarding?step=2')}
                        className="px-6 py-3 rounded-xl border border-(--color-border-primary) text-(--color-text-secondary) hover:bg-(--color-bg-hover) transition-colors font-medium"
                    >
                        ← Back
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-linear-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/25 hover:-translate-y-px hover:shadow-indigo-500/40 transition-all flex items-center gap-2 text-lg px-8 py-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {processing ? 'Saving...' : 'Save & Continue'}
                        {!processing && (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                />
                            </svg>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
