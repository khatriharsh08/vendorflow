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

export function Tabs({ tabs, activeTab, onChange }) {
    return (
        <div className="border-b border-(--color-border-primary)">
            <div className="flex gap-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange(tab.id)}
                        className={`py-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                            activeTab === tab.id
                                ? 'border-(--color-brand-primary) text-(--color-text-primary)'
                                : 'border-transparent text-(--color-text-tertiary) hover:text-(--color-text-primary)'
                        }`}
                    >
                        {tab.icon && (
                            <span className="mr-2 inline-flex items-center">
                                {renderIcon(tab.icon)}
                            </span>
                        )}
                        {tab.label}
                        {tab.badge && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-(--color-bg-tertiary) text-xs text-(--color-text-secondary)">
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

export function Breadcrumb({ items }) {
    return (
        <nav
            className="flex items-center gap-2 text-sm text-(--color-text-tertiary) mb-4"
            aria-label="Breadcrumb"
        >
            {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                    {idx > 0 && <span>/</span>}
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-(--color-text-primary) transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-(--color-text-primary)">{item.label}</span>
                    )}
                </div>
            ))}
        </nav>
    );
}

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
                <div className="glass-card p-2 min-w-[160px] shadow-token-lg">{children}</div>
            </div>
        </div>
    );
}

export function DropdownItem({ href, onClick, icon, children, danger = false }) {
    const className = `w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
        danger
            ? 'text-(--color-danger) hover:bg-(--color-danger-light)'
            : 'text-(--color-text-secondary) hover:bg-(--color-bg-hover) hover:text-(--color-text-primary)'
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
        <button type="button" onClick={onClick} className={className}>
            {icon && <span className="inline-flex items-center">{renderIcon(icon)}</span>}
            {children}
        </button>
    );
}

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
                        type="button"
                        onClick={() => toggle(item.id)}
                        className="w-full flex items-center justify-between p-4 text-left"
                    >
                        <span className="font-medium text-(--color-text-primary)">
                            {item.title}
                        </span>
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
                        <div className="px-4 pb-4 text-(--color-text-tertiary)">{item.content}</div>
                    )}
                </div>
            ))}
        </div>
    );
}

export function Pill({ children, color = 'default', onRemove }) {
    const colors = {
        default: 'bg-(--color-bg-tertiary) text-(--color-text-secondary)',
        primary: 'bg-(--color-brand-primary-light) text-(--color-brand-primary-dark)',
        success: 'bg-(--color-success-light) text-(--color-success-dark)',
        warning: 'bg-(--color-warning-light) text-(--color-warning-dark)',
        danger: 'bg-(--color-danger-light) text-(--color-danger-dark)',
    };

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[color]}`}
        >
            {children}
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="hover:opacity-70"
                    aria-label="Remove"
                >
                    x
                </button>
            )}
        </span>
    );
}

export function FilterPills({ items, selected, onChange }) {
    return (
        <div className="flex gap-2 flex-wrap">
            {items.map((item) => (
                <button
                    key={item.value}
                    type="button"
                    onClick={() => onChange(item.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selected === item.value
                            ? 'bg-(--color-brand-primary) text-white'
                            : 'bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-(--color-text-primary)'
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
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-tertiary)">
                <AppIcon name="search" className="h-4 w-4" />
            </span>
        </form>
    );
}
