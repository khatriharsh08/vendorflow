// Alert/Notification Components - Light Theme
export function Alert({ type = 'info', title, children, onClose }) {
    const types = {
        info: { bg: 'bg-[var(--color-info-light)]', border: 'border-[var(--color-info)]', text: 'text-[var(--color-info-dark)]', icon: 'ℹ️' },
        success: { bg: 'bg-[var(--color-success-light)]', border: 'border-[var(--color-success)]', text: 'text-[var(--color-success-dark)]', icon: '✓' },
        warning: { bg: 'bg-[var(--color-warning-light)]', border: 'border-[var(--color-warning)]', text: 'text-[var(--color-warning-dark)]', icon: '⚠️' },
        error: { bg: 'bg-[var(--color-danger-light)]', border: 'border-[var(--color-danger)]', text: 'text-[var(--color-danger-dark)]', icon: '✗' },
    };

    const styles = types[type];

    return (
        <div className={`p-4 rounded-xl border ${styles.bg} ${styles.border} ${styles.text}`}>
            <div className="flex items-start gap-3">
                <span className="text-lg">{styles.icon}</span>
                <div className="flex-1">
                    {title && <div className="font-semibold mb-1">{title}</div>}
                    <div className="text-sm opacity-90">{children}</div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="opacity-60 hover:opacity-100">×</button>
                )}
            </div>
        </div>
    );
}

// Toast notification (for temporary messages)
export function Toast({ message, type = 'success', onClose }) {
    const types = {
        success: 'bg-[var(--color-success)]',
        error: 'bg-[var(--color-danger)]',
        warning: 'bg-[var(--color-warning)]',
        info: 'bg-[var(--color-info)]',
    };

    return (
        <div className={`fixed bottom-4 right-4 ${types[type]} text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 animate-slide-up`}>
            <span>{message}</span>
            {onClose && (
                <button onClick={onClose} className="opacity-70 hover:opacity-100">×</button>
            )}
        </div>
    );
}

// Empty State Component
export function EmptyState({ 
    icon = '📭', 
    title = 'No data found', 
    description = null,
    action = null 
}) {
    return (
        <div className="text-center py-12">
            <span className="text-5xl block mb-4">{icon}</span>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{title}</h3>
            {description && <p className="text-[var(--color-text-tertiary)] text-sm mb-4">{description}</p>}
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
            <div className="w-full h-full border-2 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)] rounded-full animate-spin" />
        </div>
    );
}

// Loading State for pages
export function LoadingState({ message = 'Loading...' }) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" className="mb-4" />
            <span className="text-[var(--color-text-tertiary)]">{message}</span>
        </div>
    );
}

// Skeleton loader for cards
export function Skeleton({ className = '' }) {
    return (
        <div className={`animate-pulse bg-[var(--color-bg-tertiary)] rounded-lg ${className}`} />
    );
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
        return <img src={src} alt={name} className={`rounded-full object-cover ${sizes[size]} ${className}`} />;
    }

    return (
        <div className={`rounded-full bg-[var(--gradient-primary)] flex items-center justify-center text-white font-semibold ${sizes[size]} ${className}`}>
            {name?.charAt(0)?.toUpperCase() || '?'}
        </div>
    );
}

// Progress Bar
export function ProgressBar({ value = 0, max = 100, color = 'primary', showLabel = false, className = '' }) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    
    const colors = {
        primary: 'bg-[var(--color-brand-primary)]',
        success: 'bg-[var(--color-success)]',
        warning: 'bg-[var(--color-warning)]',
        danger: 'bg-[var(--color-danger)]',
        auto: percentage >= 70 ? 'bg-[var(--color-success)]' : percentage >= 40 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-danger)]',
    };

    return (
        <div className={className}>
            <div className="w-full bg-[var(--color-bg-tertiary)] rounded-full h-2">
                <div 
                    className={`h-2 rounded-full transition-all ${colors[color]}`} 
                    style={{ width: `${percentage}%` }} 
                />
            </div>
            {showLabel && (
                <div className="text-xs text-[var(--color-text-tertiary)] mt-1 text-right">{Math.round(percentage)}%</div>
            )}
        </div>
    );
}

// Divider
export function Divider({ label = null, className = '' }) {
    if (label) {
        return (
            <div className={`flex items-center gap-4 ${className}`}>
                <div className="flex-1 border-t border-[var(--color-border-primary)]" />
                <span className="text-[var(--color-text-muted)] text-sm">{label}</span>
                <div className="flex-1 border-t border-[var(--color-border-primary)]" />
            </div>
        );
    }
    return <div className={`border-t border-[var(--color-border-primary)] ${className}`} />;
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
                <div className="bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    {content}
                </div>
            </div>
        </div>
    );
}
