const statusColors = {
    default: 'bg-(--color-bg-tertiary) text-(--color-text-tertiary)',
    primary: 'bg-(--color-brand-primary-light) text-(--color-brand-primary-dark)',
    secondary: 'bg-(--color-bg-secondary) text-(--color-text-secondary)',
    danger: 'bg-(--color-danger-light) text-(--color-danger-dark)',

    draft: 'bg-(--color-bg-tertiary) text-(--color-text-tertiary)',
    submitted: 'bg-(--color-info-light) text-(--color-info-dark)',
    under_review: 'bg-(--color-warning-light) text-(--color-warning-dark)',
    approved: 'bg-(--color-success-light) text-(--color-success-dark)',
    active: 'bg-(--color-success) text-white',
    suspended: 'bg-(--color-warning-light) text-(--color-warning-dark)',
    terminated: 'bg-(--color-danger) text-white',

    pending: 'bg-(--color-warning-light) text-(--color-warning-dark)',
    verified: 'bg-(--color-success-light) text-(--color-success-dark)',
    rejected: 'bg-(--color-danger-light) text-(--color-danger-dark)',
    expired: 'bg-(--color-warning-light) text-(--color-warning-dark)',

    requested: 'bg-(--color-info-light) text-(--color-info-dark)',
    pending_ops: 'bg-(--color-warning-light) text-(--color-warning-dark)',
    pending_finance: 'bg-(--color-warning-light) text-(--color-warning-dark)',
    paid: 'bg-(--color-success) text-white',

    compliant: 'bg-(--color-success-light) text-(--color-success-dark)',
    at_risk: 'bg-(--color-warning-light) text-(--color-warning-dark)',
    non_compliant: 'bg-(--color-danger-light) text-(--color-danger-dark)',
    blocked: 'bg-(--color-danger) text-white',

    critical: 'bg-(--color-danger) text-white',
    high: 'bg-(--color-danger-light) text-(--color-danger-dark)',
    medium: 'bg-(--color-warning-light) text-(--color-warning-dark)',
    low: 'bg-(--color-info-light) text-(--color-info-dark)',

    success: 'bg-(--color-success-light) text-(--color-success-dark)',
    warning: 'bg-(--color-warning-light) text-(--color-warning-dark)',
    error: 'bg-(--color-danger-light) text-(--color-danger-dark)',
    info: 'bg-(--color-info-light) text-(--color-info-dark)',
};

export default function Badge({ status, variant, className = '', children, size = 'md' }) {
    const resolvedStatus = status ?? variant ?? 'default';
    const colorClass =
        statusColors[resolvedStatus] || 'bg-(--color-bg-tertiary) text-(--color-text-tertiary)';
    const displayText = children || resolvedStatus?.replace(/_/g, ' ');

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    };

    return (
        <span
            className={`
            inline-flex items-center font-semibold rounded-full capitalize
            ${sizeClasses[size]} ${colorClass} ${className}
        `}
        >
            {displayText}
        </span>
    );
}

export { statusColors };
