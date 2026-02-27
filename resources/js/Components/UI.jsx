import AppIcon from './AppIcon';

// Alert/Notification Components - Light Theme
export function Alert({ type = 'info', title, children, onClose }) {
    const types = {
        info: {
            bg: 'bg-(--color-info-light)',
            border: 'border-(--color-info)',
            text: 'text-(--color-info-dark)',
            icon: 'info',
        },
        success: {
            bg: 'bg-(--color-success-light)',
            border: 'border-(--color-success)',
            text: 'text-(--color-success-dark)',
            icon: 'success',
        },
        warning: {
            bg: 'bg-(--color-warning-light)',
            border: 'border-(--color-warning)',
            text: 'text-(--color-warning-dark)',
            icon: 'warning',
        },
        error: {
            bg: 'bg-(--color-danger-light)',
            border: 'border-(--color-danger)',
            text: 'text-(--color-danger-dark)',
            icon: 'error',
        },
    };

    const styles = types[type] || types.info;

    return (
        <div className={`p-4 rounded-xl border ${styles.bg} ${styles.border} ${styles.text}`}>
            <div className="flex items-start gap-3">
                <AppIcon
                    name={styles.icon}
                    className="h-5 w-5 mt-0.5 flex-shrink-0"
                    fallback={<span className="text-lg">{styles.icon}</span>}
                />
                <div className="flex-1">
                    {title && <div className="font-semibold mb-1">{title}</div>}
                    <div className="text-sm opacity-90">{children}</div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="opacity-60 hover:opacity-100">
                        x
                    </button>
                )}
            </div>
        </div>
    );
}

// Toast notification (for temporary messages)
export function Toast({ message, type = 'success', onClose }) {
    const types = {
        success: 'bg-(--color-success)',
        error: 'bg-(--color-danger)',
        warning: 'bg-(--color-warning)',
        info: 'bg-(--color-info)',
    };

    return (
        <div
            className={`fixed bottom-4 right-4 ${types[type]} text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 animate-slide-up`}
        >
            <span>{message}</span>
            {onClose && (
                <button onClick={onClose} className="opacity-70 hover:opacity-100">
                    x
                </button>
            )}
        </div>
    );
}

// Empty State Component
export function EmptyState({
    icon = 'empty',
    title = 'No data found',
    description = null,
    action = null,
}) {
    return (
        <div className="text-center py-12">
            <span className="text-5xl block mb-4 text-(--color-text-tertiary) inline-flex justify-center w-full">
                <AppIcon
                    name={icon}
                    className="h-12 w-12"
                    fallback={<span className="leading-none">{icon}</span>}
                />
            </span>
            <h3 className="text-lg font-semibold text-(--color-text-primary) mb-2">{title}</h3>
            {description && (
                <p className="text-(--color-text-tertiary) text-sm mb-4">{description}</p>
            )}
            {action}
        </div>
    );
}

// Loading Spinner
export function Spinner({ size = 'md', className = '' }) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className={`${sizes[size]} ${className}`}>
            <div className="w-full h-full border-2 border-(--color-brand-primary)/30 border-t-(--color-brand-primary) rounded-full animate-spin" />
        </div>
    );
}

// Loading State for pages
export function LoadingState({ message = 'Loading...' }) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" className="mb-4" />
            <span className="text-(--color-text-tertiary)">{message}</span>
        </div>
    );
}

// Skeleton loader for cards
export function Skeleton({ className = '' }) {
    return <div className={`animate-pulse bg-(--color-bg-tertiary) rounded-lg ${className}`} />;
}

// Avatar Component
export function Avatar({ name, src = null, size = 'md', className = '' }) {
    const sizes = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-2xl',
    };

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={`rounded-full object-cover ${sizes[size]} ${className}`}
            />
        );
    }

    return (
        <div
            className={`rounded-full bg-(--gradient-primary) flex items-center justify-center text-white font-semibold ${sizes[size]} ${className}`}
        >
            {name?.charAt(0)?.toUpperCase() || '?'}
        </div>
    );
}

// Progress Bar
export function ProgressBar({
    value = 0,
    max = 100,
    color = 'primary',
    showLabel = false,
    className = '',
}) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const colors = {
        primary: 'bg-(--color-brand-primary)',
        success: 'bg-(--color-success)',
        warning: 'bg-(--color-warning)',
        danger: 'bg-(--color-danger)',
        auto:
            percentage >= 70
                ? 'bg-(--color-success)'
                : percentage >= 40
                  ? 'bg-(--color-warning)'
                  : 'bg-(--color-danger)',
    };

    return (
        <div className={className}>
            <div className="w-full bg-(--color-bg-tertiary) rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all ${colors[color]}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <div className="text-xs text-(--color-text-tertiary) mt-1 text-right">
                    {Math.round(percentage)}%
                </div>
            )}
        </div>
    );
}

// Divider
export function Divider({ label = null, className = '' }) {
    if (label) {
        return (
            <div className={`flex items-center gap-4 ${className}`}>
                <div className="flex-1 border-t border-(--color-border-primary)" />
                <span className="text-(--color-text-muted) text-sm">{label}</span>
                <div className="flex-1 border-t border-(--color-border-primary)" />
            </div>
        );
    }
    return <div className={`border-t border-(--color-border-primary) ${className}`} />;
}

// Tooltip wrapper
export function Tooltip({ content, children, position = 'top' }) {
    const positions = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div className="relative group inline-block">
            {children}
            <div className={`absolute ${positions[position]} hidden group-hover:block z-50`}>
                <div className="bg-(--color-text-primary) text-(--color-bg-primary) text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    {content}
                </div>
            </div>
        </div>
    );
}
