import { useState } from 'react';

/**
 * Reusable Document Viewer Modal
 * Use this component to view documents in a popup across the application.
 *
 * Usage:
 * <DocumentViewer
 *     document={selectedDocument}
 *     isOpen={showViewer}
 *     onClose={() => setShowViewer(false)}
 * />
 */
export function DocumentViewer({ document, isOpen, onClose }) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    if (!isOpen || !document) return null;

    const viewUrl = `/documents/${document.id}/view`;
    const downloadUrl = `/documents/${document.id}/download`;

    // Determine file type for proper rendering
    const fileName = document.file_name || '';
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

    const handleLoad = () => {
        setIsLoading(false);
        setError(null);
    };

    const handleError = () => {
        setIsLoading(false);
        setError('Failed to load document. Please try downloading instead.');
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{isPdf ? '📄' : isImage ? '🖼️' : '📎'}</span>
                        <div>
                            <h3 className="font-semibold text-gray-900 truncate max-w-md">
                                {document.document_type?.display_name || 'Document'}
                            </h3>
                            <p className="text-sm text-gray-500 truncate max-w-md">{fileName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={downloadUrl}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors inline-flex items-center gap-2"
                        >
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
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            Download
                        </a>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
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
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4 bg-white min-h-[400px] relative">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-500">Loading document...</p>
                            </div>
                        </div>
                    )}

                    {error ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <span className="text-4xl">⚠️</span>
                            <p className="text-gray-600">{error}</p>
                            <a
                                href={downloadUrl}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Download Instead
                            </a>
                        </div>
                    ) : isPdf ? (
                        <iframe
                            src={viewUrl}
                            className="w-full h-full min-h-[500px] rounded-lg border border-gray-200 bg-white"
                            onLoad={handleLoad}
                            onError={handleError}
                            title={fileName}
                            style={{ backgroundColor: 'white' }}
                        />
                    ) : isImage ? (
                        <div className="flex items-center justify-center h-full">
                            <img
                                src={viewUrl}
                                alt={fileName}
                                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                                onLoad={handleLoad}
                                onError={handleError}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <span className="text-6xl">📎</span>
                            <p className="text-gray-600">This file type cannot be previewed.</p>
                            <a
                                href={downloadUrl}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Download File
                            </a>
                        </div>
                    )}
                </div>

                {/* Footer with document info */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                            {document.verification_status && (
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        document.verification_status === 'approved' ||
                                        document.verification_status === 'verified'
                                            ? 'bg-green-100 text-green-700'
                                            : document.verification_status === 'rejected'
                                              ? 'bg-red-100 text-red-700'
                                              : 'bg-yellow-100 text-yellow-700'
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
