export function FormInput({
    label,
    type = 'text',
    value,
    onChange,
    error = null,
    placeholder = '',
    required = false,
    disabled = false,
    icon = null,
    className = '',
}) {
    return (
        <div className={className}>
            {label && (
                <label className="text-sm font-semibold text-(--color-text-primary) mb-2 block">
                    {label} {required && <span className="text-(--color-danger)">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-tertiary)">
                        {icon}
                    </span>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`
                        w-full bg-(--color-bg-primary) border-2 border-(--color-border-primary) rounded-xl px-4 py-3 text-(--color-text-primary)
                        placeholder:text-(--color-text-placeholder) transition-all duration-300
                        focus:outline-none focus:border-(--color-brand-primary) focus:ring-4 focus:ring-(--color-brand-primary)/10
                        hover:border-(--color-border-secondary) disabled:bg-(--color-bg-secondary) disabled:cursor-not-allowed
                        ${icon ? 'pl-10' : ''}
                        ${error ? 'border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger)/10' : ''}
                    `}
                />
            </div>
            {error && (
                <p className="text-sm text-(--color-danger) mt-1.5 flex items-center gap-1">
                    <span>⚠️</span> {error}
                </p>
            )}
        </div>
    );
}

export function FormTextarea({
    label,
    value,
    onChange,
    error = null,
    placeholder = '',
    required = false,
    disabled = false,
    rows = 4,
    className = '',
}) {
    return (
        <div className={className}>
            {label && (
                <label className="text-sm font-semibold text-(--color-text-primary) mb-2 block">
                    {label} {required && <span className="text-(--color-danger)">*</span>}
                </label>
            )}
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                rows={rows}
                className={`
                    w-full bg-(--color-bg-primary) border-2 border-(--color-border-primary) rounded-xl px-4 py-3 text-(--color-text-primary)
                    placeholder:text-(--color-text-placeholder) transition-all duration-300 resize-none
                    focus:outline-none focus:border-(--color-brand-primary) focus:ring-4 focus:ring-(--color-brand-primary)/10
                    hover:border-(--color-border-secondary) disabled:bg-(--color-bg-secondary) disabled:cursor-not-allowed
                    ${error ? 'border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger)/10' : ''}
                `}
            />
            {error && (
                <p className="text-sm text-(--color-danger) mt-1.5 flex items-center gap-1">
                    <span>⚠️</span> {error}
                </p>
            )}
        </div>
    );
}

export function FormSelect({
    label,
    value,
    onChange,
    options = [],
    error = null,
    placeholder = 'Select...',
    required = false,
    disabled = false,
    className = '',
}) {
    return (
        <div className={className}>
            {label && (
                <label className="text-sm font-semibold text-(--color-text-primary) mb-2 block">
                    {label} {required && <span className="text-(--color-danger)">*</span>}
                </label>
            )}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                disabled={disabled}
                className={`
                    w-full bg-(--color-bg-primary) border-2 border-(--color-border-primary) rounded-xl px-4 py-3 text-(--color-text-primary)
                    transition-all duration-300 cursor-pointer appearance-none
                    focus:outline-none focus:border-(--color-brand-primary) focus:ring-4 focus:ring-(--color-brand-primary)/10
                    hover:border-(--color-border-secondary) disabled:bg-(--color-bg-secondary) disabled:cursor-not-allowed
                    ${error ? 'border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger)/10' : ''}
                `}
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                }}
            >
                <option value="" className="text-(--color-text-muted)">
                    {placeholder}
                </option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="text-sm text-(--color-danger) mt-1.5 flex items-center gap-1">
                    <span>⚠️</span> {error}
                </p>
            )}
        </div>
    );
}

export function FormCheckbox({ label, checked, onChange, className = '' }) {
    return (
        <label
            className={`flex items-center gap-3 text-sm text-(--color-text-secondary) cursor-pointer group ${className}`}
        >
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only peer"
                />
                <div className="w-5 h-5 rounded-md border-2 border-(--color-border-primary) bg-(--color-bg-primary) transition-all duration-200 peer-checked:bg-(--color-brand-primary) peer-checked:border-(--color-brand-primary) peer-focus:ring-4 peer-focus:ring-(--color-brand-primary)/20 group-hover:border-(--color-brand-primary)"></div>
                <svg
                    className="absolute top-1 left-1 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                    />
                </svg>
            </div>
            <span className="font-medium">{label}</span>
        </label>
    );
}

// Button component for forms
export function FormButton({
    children,
    type = 'button',
    variant = 'primary',
    disabled = false,
    loading = false,
    onClick,
    className = '',
}) {
    const variants = {
        primary:
            'bg-(--color-brand-primary) text-white shadow-lg shadow-(--color-brand-primary)/30 hover:-translate-y-0.5',
        secondary:
            'bg-(--color-bg-primary) text-(--color-text-secondary) border-2 border-(--color-border-primary) hover:border-(--color-brand-primary) hover:text-(--color-brand-primary)',
        success: 'bg-(--color-success) text-white shadow-lg shadow-(--color-success)/30',
        danger: 'bg-(--color-danger) text-white shadow-lg shadow-(--color-danger)/30',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                px-6 py-3 rounded-xl font-semibold transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                ${variants[variant]} ${className}
            `}
        >
            {loading ? (
                <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    Processing...
                </span>
            ) : (
                children
            )}
        </button>
    );
}
