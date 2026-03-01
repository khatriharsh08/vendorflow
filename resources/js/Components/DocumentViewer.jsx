import { useEffect, useState } from 'react';
import AppIcon from './AppIcon';

export function DocumentViewer({ document, isOpen, onClose }) {
    const viewUrl = document?.preview_url || (document ? `/documents/${document.id}/view` : '');
    const downloadUrl =
        document?.download_url || (document ? `/documents/${document.id}/download` : '');

    const fileName = document?.file_name || '';
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
    const isPreviewable = Boolean(isOpen && document && (isPdf || isImage));

    const [isLoading, setIsLoading] = useState(isPreviewable);
    const [error, setError] = useState(null);
    const [previewSrc, setPreviewSrc] = useState(null);

    useEffect(() => {
        if (!isPreviewable) {
            return undefined;
        }

        const controller = new AbortController();
        let objectUrl = null;

        fetch(viewUrl, {
            credentials: 'same-origin',
            signal: controller.signal,
            headers: {
                Accept: isPdf ? 'application/pdf,*/*' : 'image/*,*/*',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Preview request failed (${response.status})`);
                }

                return response.blob();
            })
            .then((blob) => {
                objectUrl = URL.createObjectURL(blob);
                setPreviewSrc(objectUrl);
                setError(null);
                setIsLoading(false);
            })
            .catch(() => {
                if (controller.signal.aborted) {
                    return;
                }

                setError('Failed to load document. Please use Open or Download.');
                setIsLoading(false);
            });

        return () => {
            controller.abort();
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [isPdf, isPreviewable, viewUrl]);

    if (!isOpen || !document) return null;

    const handleLoad = () => setIsLoading(false);
    const handleError = () => setError('Failed to load document. Please use Open or Download.');

    const typeIcon = 'documents';

    return (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-modal rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-(--color-border-primary)">
                    <div className="flex items-center gap-3 min-w-0">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-(--color-bg-secondary) text-(--color-brand-primary)">
                            <AppIcon name={typeIcon} className="h-5 w-5" fallback="DOC" />
                        </span>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-(--color-text-primary) truncate max-w-md">
                                {document.document_type?.display_name || 'Document'}
                            </h3>
                            <p className="text-sm text-(--color-text-tertiary) truncate max-w-md">
                                {fileName}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={viewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-secondary text-sm inline-flex items-center"
                        >
                            <AppIcon name="documents" className="h-4 w-4" />
                            Open
                        </a>
                        <a
                            href={downloadUrl}
                            className="btn-secondary text-sm inline-flex items-center"
                        >
                            <AppIcon name="documents" className="h-4 w-4" />
                            Download
                        </a>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-(--color-text-tertiary) hover:text-(--color-text-primary) hover:bg-(--color-bg-hover) rounded-lg transition-colors"
                            aria-label="Close document viewer"
                        >
                            <AppIcon name="x-mark" className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4 bg-(--color-bg-primary) min-h-[400px] relative">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-(--color-bg-primary) z-10">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-4 border-(--color-brand-primary) border-t-transparent rounded-full animate-spin" />
                                <p className="text-(--color-text-tertiary)">Loading document...</p>
                            </div>
                        </div>
                    )}

                    {error ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-(--color-warning-light) text-(--color-warning-dark)">
                                <AppIcon name="warning" className="h-7 w-7" />
                            </span>
                            <p className="text-(--color-text-secondary)">{error}</p>
                            <div className="flex items-center gap-3">
                                <a
                                    href={viewUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-secondary"
                                >
                                    Open
                                </a>
                                <a href={downloadUrl} className="btn-primary">
                                    Download
                                </a>
                            </div>
                        </div>
                    ) : isPdf ? (
                        <iframe
                            src={previewSrc || ''}
                            className="w-full h-full min-h-[500px] rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary)"
                            onLoad={handleLoad}
                            onError={handleError}
                            title={fileName}
                        />
                    ) : isImage ? (
                        <div className="flex items-center justify-center h-full">
                            <img
                                src={previewSrc || ''}
                                alt={fileName}
                                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-token-lg"
                                onLoad={handleLoad}
                                onError={handleError}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-(--color-bg-secondary) text-(--color-brand-primary)">
                                <AppIcon name="documents" className="h-8 w-8" />
                            </span>
                            <p className="text-(--color-text-secondary)">
                                This file type cannot be previewed.
                            </p>
                            <a href={downloadUrl} className="btn-primary">
                                Download File
                            </a>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-(--color-border-primary) bg-(--color-bg-secondary) rounded-b-2xl">
                    <div className="flex items-center justify-between text-sm text-(--color-text-tertiary)">
                        <div className="flex items-center gap-4 flex-wrap">
                            {document.verification_status && (
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        document.verification_status === 'approved' ||
                                        document.verification_status === 'verified'
                                            ? 'bg-(--color-success-light) text-(--color-success-dark)'
                                            : document.verification_status === 'rejected'
                                              ? 'bg-(--color-danger-light) text-(--color-danger-dark)'
                                              : 'bg-(--color-warning-light) text-(--color-warning-dark)'
                                    }`}
                                >
                                    {document.verification_status}
                                </span>
                            )}
                            {document.created_at && (
                                <span>
                                    Uploaded: {new Date(document.created_at).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DocumentViewer;
