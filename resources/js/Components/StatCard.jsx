import AppIcon from './AppIcon';

// Professional StatCard Component with refined styling
export default function StatCard({
    label,
    value,
    icon,
    color = 'primary', // 'primary', 'success', 'warning', 'danger', 'info'
    trend = null, // { value: '+12%', positive: true }
    onClick = null,
    className = '',
}) {
    const Component = onClick ? 'button' : 'div';

    // Professional icon backgrounds using global variables
    const iconStyles = {
        primary: 'icon-bg-primary',
        success: 'icon-bg-success',
        warning: 'icon-bg-warning',
        danger: 'icon-bg-danger',
        info: 'icon-bg-info',
    };

    return (
        <Component
            onClick={onClick}
            className={`
                bg-(--color-bg-primary) rounded-xl p-3 border border-(--color-border-primary)
                shadow-token-sm hover:shadow-token-lg hover:border-(--color-brand-primary-light)
                transition-all duration-300
                text-left w-full group relative overflow-hidden
                hover:-translate-y-0.5
                ${onClick ? 'cursor-pointer' : ''}
                ${className}
            `}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-xl font-bold text-(--color-text-primary) tracking-tight leading-none mb-1">
                        {value}
                    </div>
                    <div className="text-xs font-medium text-(--color-text-tertiary) truncate">
                        {label}
                    </div>
                    {trend && (
                        <div
                            className={`text-xs font-medium mt-1 ${
                                trend.positive ? 'text-(--color-success)' : 'text-(--color-danger)'
                            }`}
                        >
                            {trend.value}
                        </div>
                    )}
                </div>
                <div
                    className={`p-2 rounded-lg flex-shrink-0 ${iconStyles[color]} opacity-80 group-hover:opacity-100 transition-opacity`}
                >
                    <AppIcon
                        name={icon}
                        className="h-5 w-5"
                        fallback={
                            <span className="text-sm leading-none block font-semibold">{icon}</span>
                        }
                    />
                </div>
            </div>

            {/* Hover Effect Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
        </Component>
    );
}

// Grid wrapper for stat cards with proper gaps
export function StatGrid({ children, cols = 6 }) {
    const colClasses = {
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-2 lg:grid-cols-4',
        5: 'md:grid-cols-3 lg:grid-cols-5',
        6: 'md:grid-cols-3 lg:grid-cols-6',
    };

    return <div className={`grid gap-4 ${colClasses[cols] || colClasses[6]}`}>{children}</div>;
}
