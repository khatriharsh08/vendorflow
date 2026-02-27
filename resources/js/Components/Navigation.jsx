import React from 'react';
import { Link } from '@inertiajs/react';
import AppIcon from './AppIcon';

function renderIcon(icon, className = 'h-4 w-4') {
    if (!icon) {
        return null;
    }

    if (typeof icon !== 'string') {
        return icon;
    }

    return <AppIcon name={icon} className={className} fallback={<span>{icon}</span>} />;
}

// Tabs Component
export function Tabs({ tabs, activeTab, onChange }) {
    return (
        <div className="border-b border-slate-800">
            <div className="flex gap-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`py-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                            activeTab === tab.id
                                ? 'border-indigo-500 text-white'
                                : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                    >
                        {tab.icon && (
                            <span className="mr-2 inline-flex items-center">
                                {renderIcon(tab.icon)}
                            </span>
                        )}
                        {tab.label}
                        {tab.badge && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-700 text-xs">
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

// Breadcrumb Component
export function Breadcrumb({ items }) {
    return (
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                    {idx > 0 && <span>/</span>}
                    {item.href ? (
                        <Link href={item.href} className="hover:text-white transition-colors">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-white">{item.label}</span>
                    )}
                </div>
            ))}
        </nav>
    );
}

// Dropdown Menu
export function Dropdown({ trigger, children, align = 'right' }) {
    const alignments = {
        left: 'left-0',
        right: 'right-0',
        center: 'left-1/2 -translate-x-1/2',
    };

    return (
        <div className="relative group">
            {trigger}
            <div
                className={`absolute ${alignments[align]} top-full mt-2 hidden group-hover:block z-50`}
            >
                <div className="glass-card p-2 min-w-[160px] shadow-xl">{children}</div>
            </div>
        </div>
    );
}

export function DropdownItem({ href, onClick, icon, children, danger = false }) {
    const className = `w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
        danger
            ? 'text-red-400 hover:bg-red-500/20'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

    if (href) {
        return (
            <Link href={href} className={className}>
                {icon && <span className="inline-flex items-center">{renderIcon(icon)}</span>}
                {children}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={className}>
            {icon && <span className="inline-flex items-center">{renderIcon(icon)}</span>}
            {children}
        </button>
    );
}

// Accordion Component
export function Accordion({ items, allowMultiple = false }) {
    const [openItems, setOpenItems] = React.useState([]);

    const toggle = (id) => {
        if (allowMultiple) {
            setOpenItems((prev) =>
                prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
            );
        } else {
            setOpenItems((prev) => (prev.includes(id) ? [] : [id]));
        }
    };

    return (
        <div className="space-y-2">
            {items.map((item) => (
                <div key={item.id} className="glass-card overflow-hidden">
                    <button
                        onClick={() => toggle(item.id)}
                        className="w-full flex items-center justify-between p-4 text-left"
                    >
                        <span className="font-medium text-white">{item.title}</span>
                        <span
                            className={`inline-flex transform transition-transform ${openItems.includes(item.id) ? 'rotate-180' : ''}`}
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </span>
                    </button>
                    {openItems.includes(item.id) && (
                        <div className="px-4 pb-4 text-slate-400">{item.content}</div>
                    )}
                </div>
            ))}
        </div>
    );
}

// Pill/Tag Component
export function Pill({ children, color = 'default', onRemove }) {
    const colors = {
        default: 'bg-slate-700 text-slate-300',
        primary: 'bg-indigo-500/20 text-indigo-400',
        success: 'bg-green-500/20 text-green-400',
        warning: 'bg-yellow-500/20 text-yellow-400',
        danger: 'bg-red-500/20 text-red-400',
    };

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[color]}`}
        >
            {children}
            {onRemove && (
                <button onClick={onRemove} className="hover:opacity-70" aria-label="Remove">
                    x
                </button>
            )}
        </span>
    );
}

// Filter Pills
export function FilterPills({ items, selected, onChange }) {
    return (
        <div className="flex gap-2 flex-wrap">
            {items.map((item) => (
                <button
                    key={item.value}
                    onClick={() => onChange(item.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selected === item.value
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                >
                    {item.label}
                    {item.count !== undefined && (
                        <span className="ml-2 opacity-60">({item.count})</span>
                    )}
                </button>
            ))}
        </div>
    );
}

// Search Input with icon
export function SearchInput({ value, onChange, onSubmit, placeholder = 'Search...' }) {
    return (
        <form onSubmit={onSubmit} className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="input-field w-full pl-10"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <AppIcon name="search" className="h-4 w-4" />
            </span>
        </form>
    );
}
