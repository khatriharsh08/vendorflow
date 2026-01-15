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
export { Tabs, Breadcrumb, Dropdown, DropdownItem, Accordion, Pill, FilterPills, SearchInput } from './Navigation';

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
    Tooltip 
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
    className = ''
}) {
    const variants = {
        primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
        success: 'bg-green-600 hover:bg-green-700 text-white',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
        ghost: 'hover:bg-gray-100 text-gray-600 hover:text-gray-900',
        outline: 'border border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50',
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

export function LinkButton({ 
    href, 
    children, 
    variant = 'primary',
    size = 'md',
    className = '' 
}) {
    const variants = {
        primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
        ghost: 'hover:bg-slate-800 text-slate-400 hover:text-white',
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
        ghost: 'hover:bg-slate-800 text-slate-400 hover:text-white',
        primary: 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400',
        danger: 'hover:bg-red-500/20 text-slate-400 hover:text-red-400',
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
