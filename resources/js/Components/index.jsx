// =====================================
// LAYOUT COMPONENTS
// =====================================
export { default as AdminLayout } from './AdminLayout';
export { default as VendorLayout } from './VendorLayout';
export { default as GuestLayout, AuthLayout } from './GuestLayout';

// =====================================
// NAVIGATION COMPONENTS
// =====================================
export { default as Sidebar } from './Sidebar';
export { default as Navbar, NavLink } from './Navbar';
export { default as Footer, FooterMinimal } from './Footer';
export { default as PageHeader } from './PageHeader';
export { default as Logo } from './Logo';
export {
    Tabs,
    Breadcrumb,
    Dropdown,
    DropdownItem,
    Accordion,
    Pill,
    FilterPills,
    SearchInput,
} from './Navigation';

// =====================================
// DATA DISPLAY COMPONENTS
// =====================================
export { default as Badge, statusColors } from './Badge';
export { default as DataTable, Card, ListCard } from './DataTable';
export { default as StatCard, StatGrid } from './StatCard';

// =====================================
// FORM COMPONENTS
// =====================================
export { FormInput, FormTextarea, FormSelect, FormCheckbox } from './FormInputs';

// =====================================
// MODAL COMPONENTS
// =====================================
export { default as Modal, ModalCancelButton, ModalPrimaryButton } from './Modal';

// =====================================
// UI UTILITIES
// =====================================
export {
    Alert,
    Toast,
    EmptyState,
    Spinner,
    LoadingState,
    Skeleton,
    Avatar,
    ProgressBar,
    Divider,
    Tooltip,
} from './UI';

// =====================================
// BUTTON COMPONENTS
// =====================================
import { Link } from '@inertiajs/react';

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    onClick,
    type = 'button',
    className = '',
}) {
    const variants = {
        primary:
            'bg-(--color-brand-primary) hover:bg-(--color-brand-primary-hover) text-white shadow-md shadow-(--color-brand-primary)/30',
        secondary:
            'bg-(--color-bg-secondary) hover:bg-(--color-bg-tertiary) text-(--color-text-secondary)',
        success: 'bg-(--color-success) hover:bg-(--color-success-dark) text-white',
        danger: 'bg-(--color-danger) hover:bg-(--color-danger-dark) text-white',
        warning: 'bg-(--color-warning) hover:bg-(--color-warning-dark) text-white',
        ghost: 'hover:bg-(--color-bg-secondary) text-(--color-text-secondary) hover:text-(--color-text-primary)',
        outline:
            'border border-(--color-border-primary) hover:border-(--color-border-secondary) text-(--color-text-secondary) hover:bg-(--color-bg-secondary)',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center gap-2 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </button>
    );
}

export function LinkButton({ href, children, variant = 'primary', size = 'md', className = '' }) {
    const variants = {
        primary: 'bg-(--color-brand-primary) hover:bg-(--color-brand-primary-hover) text-white',
        secondary:
            'bg-(--color-bg-secondary) hover:bg-(--color-bg-tertiary) text-(--color-text-secondary)',
        ghost: 'hover:bg-(--color-bg-secondary) text-(--color-text-muted) hover:text-(--color-text-primary)',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3',
    };

    return (
        <Link
            href={href}
            className={`inline-block rounded-lg font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </Link>
    );
}

// =====================================
// ICON BUTTON
// =====================================
export function IconButton({ icon, onClick, variant = 'ghost', size = 'md', title = '' }) {
    const variants = {
        ghost: 'hover:bg-(--color-bg-secondary) text-(--color-text-muted) hover:text-(--color-text-primary)',
        primary:
            'bg-(--color-brand-primary)/10 hover:bg-(--color-brand-primary)/20 text-(--color-brand-primary)',
        danger: 'hover:bg-(--color-danger)/10 text-(--color-text-muted) hover:text-(--color-danger)',
    };

    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
    };

    return (
        <button
            onClick={onClick}
            title={title}
            className={`${sizes[size]} rounded-lg flex items-center justify-center transition-colors ${variants[variant]}`}
        >
            {icon}
        </button>
    );
}

// =====================================
// COPY TO CLIPBOARD BUTTON
// =====================================
export function CopyButton({ text, className = '' }) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className={`px-2 py-1 rounded text-xs transition-colors ${
                copied
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
            } ${className}`}
        >
            {copied ? '✓ Copied' : '📋 Copy'}
        </button>
    );
}

import React from 'react';
