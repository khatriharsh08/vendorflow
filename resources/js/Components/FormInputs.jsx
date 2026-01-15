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
    className = ''
}) {
    return (
        <div className={className}>
            {label && (
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </span>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`
                        w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800
                        placeholder:text-gray-400 transition-all duration-300
                        focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
                        hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed
                        ${icon ? 'pl-10' : ''}
                        ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100' : ''}
                    `}
                />
            </div>
            {error && (
                <p className="text-sm text-rose-600 mt-1.5 flex items-center gap-1">
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
    className = ''
}) {
    return (
        <div className={className}>
            {label && (
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                rows={rows}
                className={`
                    w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800
                    placeholder:text-gray-400 transition-all duration-300 resize-none
                    focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
                    hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed
                    ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100' : ''}
                `}
            />
            {error && (
                <p className="text-sm text-rose-600 mt-1.5 flex items-center gap-1">
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
    className = ''
}) {
    return (
        <div className={className}>
            {label && (
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                required={required}
                disabled={disabled}
                className={`
                    w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800
                    transition-all duration-300 cursor-pointer appearance-none
                    focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
                    hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed
                    ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100' : ''}
                `}
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                }}
            >
                <option value="" className="text-gray-400">{placeholder}</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {error && (
                <p className="text-sm text-rose-600 mt-1.5 flex items-center gap-1">
                    <span>⚠️</span> {error}
                </p>
            )}
        </div>
    );
}

export function FormCheckbox({ 
    label, 
    checked, 
    onChange, 
    className = '' 
}) {
    return (
        <label className={`flex items-center gap-3 text-sm text-gray-700 cursor-pointer group ${className}`}>
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => onChange(e.target.checked)}
                    className="sr-only peer"
                />
                <div className="w-5 h-5 rounded-md border-2 border-gray-300 bg-white transition-all duration-200 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 peer-focus:ring-4 peer-focus:ring-indigo-100 group-hover:border-indigo-400">
                </div>
                <svg 
                    className="absolute top-1 left-1 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
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
    className = '' 
}) {
    const variants = {
        primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5',
        secondary: 'bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300 hover:text-indigo-600',
        success: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200',
        danger: 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-200',
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
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                </span>
            ) : children}
        </button>
    );
}
