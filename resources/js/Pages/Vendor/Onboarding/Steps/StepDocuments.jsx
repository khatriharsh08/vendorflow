import { useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';

export default function StepDocuments({ documentTypes, sessionData }) {
    const [uploadedDocs, setUploadedDocs] = useState([]);
    const [expiryByType, setExpiryByType] = useState({});
    const [localErrors, setLocalErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const sessionDocs = useMemo(() => sessionData?.step3?.documents || [], [sessionData]);
    const normalizeTypeId = (typeId) => String(typeId ?? '');
    const { props } = usePage();
    const errors = props.errors || {};

    const documentTypesById = useMemo(() => {
        const map = new Map();

        (Array.isArray(documentTypes) ? documentTypes : []).forEach((type) => {
            map.set(normalizeTypeId(type.id), type);
        });

        return map;
    }, [documentTypes]);

    const sessionDocsByType = useMemo(() => {
        const docsMap = new Map();

        (Array.isArray(sessionDocs) ? sessionDocs : []).forEach((doc) => {
            docsMap.set(normalizeTypeId(doc.document_type_id), doc);
        });

        return docsMap;
    }, [sessionDocs]);

    const handleFileUpload = (typeId, file) => {
        const normalizedTypeId = normalizeTypeId(typeId);
        const existingExpiry = sessionDocsByType.get(normalizedTypeId)?.expiry_date ?? '';

        setUploadedDocs((prev) => {
            const filtered = prev.filter((d) => d.typeId !== normalizedTypeId);
            return [...filtered, { typeId: normalizedTypeId, file, name: file.name }];
        });

        setExpiryByType((prev) => ({
            ...prev,
            [normalizedTypeId]: prev[normalizedTypeId] ?? existingExpiry,
        }));

        setLocalErrors((prev) => {
            const next = { ...prev };
            delete next[normalizedTypeId];
            return next;
        });
    };

    const handleExpiryChange = (typeId, expiryDate) => {
        const normalizedTypeId = normalizeTypeId(typeId);

        setExpiryByType((prev) => ({
            ...prev,
            [normalizedTypeId]: expiryDate,
        }));

        setLocalErrors((prev) => {
            const next = { ...prev };
            delete next[normalizedTypeId];
            return next;
        });
    };

    const formatExpiryDate = (value) => {
        if (!value) {
            return '-';
        }

        const date = new Date(`${value}T00:00:00`);
        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const submit = (e) => {
        e.preventDefault();

        const nextLocalErrors = {};
        uploadedDocs.forEach((doc) => {
            const docType = documentTypesById.get(doc.typeId);
            const expiryDate = expiryByType[doc.typeId] || '';

            if (docType?.has_expiry && !expiryDate) {
                nextLocalErrors[doc.typeId] = 'Expiry date is required for this document type.';
            }
        });

        setLocalErrors(nextLocalErrors);
        if (Object.keys(nextLocalErrors).length > 0) {
            return;
        }

        const formData = new FormData();
        uploadedDocs.forEach((doc, index) => {
            formData.append(`documents[${index}][document_type_id]`, doc.typeId);
            formData.append(`documents[${index}][file]`, doc.file);

            const expiryDate = expiryByType[doc.typeId] || '';
            if (expiryDate) {
                formData.append(`documents[${index}][expiry_date]`, expiryDate);
            }
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

    const getFileError = (index) => {
        return (
            errors[`documents.${index}.file`] ||
            errors[`documents.${index}.document_type_id`] ||
            errors[`documents.${index}.expiry_date`]
        );
    };

    return (
        <div className="bg-(--color-bg-primary) border border-(--color-border-primary) rounded-2xl p-8 md:p-12 shadow-token-lg animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-(--color-text-primary)">
                    Upload Documents
                </h1>
                <p className="text-(--color-text-tertiary)">
                    Upload required documents for verification. Files marked with * are mandatory.
                </p>
                {errors.documents && (
                    <div className="mt-4 p-4 bg-(--color-danger-light) border border-(--color-danger) rounded-lg text-(--color-danger) text-sm">
                        {errors.documents}
                    </div>
                )}
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div className="grid gap-4">
                    {(!documentTypes || documentTypes.length === 0) && (
                        <div className="p-4 rounded-xl border border-(--color-warning) bg-(--color-warning-light) text-(--color-warning-dark) text-sm">
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
                        const backendError =
                            uploadedIndex !== -1 ? getFileError(uploadedIndex) : null;
                        const error = backendError || localErrors[normalizedTypeId] || null;
                        const typeRequiresExpiry = Boolean(docType.has_expiry);
                        const canEditExpiry = Boolean(uploadedDoc);
                        const expiryValue = canEditExpiry
                            ? expiryByType[normalizedTypeId] || ''
                            : (sessionDoc?.expiry_date ?? '');

                        return (
                            <div
                                key={docType.id}
                                className={`p-4 rounded-xl border transition-all ${
                                    hasUploadedDoc
                                        ? 'border-(--color-success) bg-(--color-success-light)'
                                        : 'border-(--color-border-primary) bg-(--color-bg-secondary)'
                                } ${error ? 'border-(--color-danger) bg-(--color-danger-light)' : ''}`}
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
                                        {typeRequiresExpiry && (
                                            <div className="mt-3 max-w-xs">
                                                <label className="block text-xs font-semibold text-(--color-text-secondary) mb-1">
                                                    Expiry Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={expiryValue}
                                                    disabled={!canEditExpiry}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    onChange={(event) =>
                                                        handleExpiryChange(
                                                            normalizedTypeId,
                                                            event.target.value
                                                        )
                                                    }
                                                    className={`w-full rounded-lg border px-3 py-2 text-sm bg-(--color-bg-primary) ${
                                                        canEditExpiry
                                                            ? 'border-(--color-border-primary) text-(--color-text-primary)'
                                                            : 'border-(--color-border-secondary) text-(--color-text-tertiary) cursor-not-allowed'
                                                    }`}
                                                />
                                                {sessionDoc?.expiry_date && !canEditExpiry && (
                                                    <p className="mt-1 text-xs text-(--color-text-tertiary)">
                                                        Current expiry:{' '}
                                                        {formatExpiryDate(sessionDoc.expiry_date)}
                                                    </p>
                                                )}
                                                {!sessionDoc?.expiry_date && !canEditExpiry && (
                                                    <p className="mt-1 text-xs text-(--color-text-tertiary)">
                                                        Upload file first, then set expiry date.
                                                    </p>
                                                )}
                                            </div>
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
                                        {typeRequiresExpiry && hasUploadedDoc && (
                                            <p className="text-xs text-(--color-text-tertiary) mt-1">
                                                Expires on:{' '}
                                                {formatExpiryDate(
                                                    canEditExpiry
                                                        ? expiryByType[normalizedTypeId]
                                                        : sessionDoc?.expiry_date
                                                )}
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
                        Back
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-gradient-primary text-white font-semibold rounded-lg shadow-token-primary hover:-translate-y-px hover:shadow-token-primary transition-all flex items-center gap-2 text-lg px-8 py-3 disabled:opacity-70 disabled:cursor-not-allowed"
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
