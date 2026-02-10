export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer = null,
    size = 'md', // sm, md, lg, xl
}) {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className={`relative glass-card p-6 w-full ${sizeClasses[size]} transform transition-all`}
                >
                    {/* Header */}
                    {title && (
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">{title}</h3>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-white transition-colors"
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
                    )}

                    {/* Content */}
                    <div>{children}</div>

                    {/* Footer */}
                    {footer && (
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Common button components for modal footers
export function ModalCancelButton({ onClick, children = 'Cancel' }) {
    return (
        <button
            onClick={onClick}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
        >
            {children}
        </button>
    );
}

export function ModalPrimaryButton({ onClick, disabled = false, variant = 'primary', children }) {
    const variants = {
        primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        success: 'bg-green-600 hover:bg-green-700 text-white',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
        >
            {children}
        </button>
    );
}
