// Professional Badge Component
const statusColors = {
    // Vendor statuses
    draft: 'bg-gray-100 text-gray-600',
    submitted: 'bg-blue-100 text-blue-700',
    under_review: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    active: 'bg-emerald-500 text-white',
    suspended: 'bg-orange-100 text-orange-700',
    terminated: 'bg-rose-500 text-white',
    
    // Document statuses
    pending: 'bg-amber-100 text-amber-700',
    verified: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-rose-100 text-rose-700',
    expired: 'bg-orange-100 text-orange-700',
    
    // Payment statuses
    requested: 'bg-blue-100 text-blue-700',
    pending_ops: 'bg-amber-100 text-amber-700',
    pending_finance: 'bg-orange-100 text-orange-700',
    paid: 'bg-emerald-500 text-white',
    
    // Compliance statuses
    compliant: 'bg-emerald-100 text-emerald-700',
    at_risk: 'bg-amber-100 text-amber-700',
    non_compliant: 'bg-rose-100 text-rose-700',
    blocked: 'bg-rose-500 text-white',
    
    // Severity levels
    critical: 'bg-rose-500 text-white',
    high: 'bg-rose-100 text-rose-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-blue-100 text-blue-700',
    
    // Generic
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-rose-100 text-rose-700',
    info: 'bg-blue-100 text-blue-700',
};

export default function Badge({ status, className = '', children, size = 'md' }) {
    const colorClass = statusColors[status] || 'bg-gray-100 text-gray-600';
    const displayText = children || status?.replace(/_/g, ' ');
    
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    };
    
    return (
        <span className={`
            inline-flex items-center font-semibold rounded-full capitalize
            ${sizeClasses[size]} ${colorClass} ${className}
        `}>
            {displayText}
        </span>
    );
}

export { statusColors };
