import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AppIcon from './AppIcon';
import ThemeSwitcher from './ThemeSwitcher';

const vendorLinks = [
    { label: 'Write Tools', href: '/vendor/onboarding', icon: 'onboarding' },
    { label: 'Documents', href: '/vendor/documents', icon: 'documents' },
    { label: 'Compliance', href: '/vendor/compliance', icon: 'compliance' },
    { label: 'Payments', href: '/vendor/payments', icon: 'payments' },
];

const adminLinks = [
    { label: 'Admin Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Vendors', href: '/admin/vendors', icon: 'vendors' },
    { label: 'Payments', href: '/admin/payments', icon: 'payments' },
    { label: 'Reports', href: '/admin/reports', icon: 'reports' },
];

function HeaderToolsMenu({ mode }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    const links = mode === 'admin' ? adminLinks : vendorLinks;
    const label = mode === 'admin' ? 'Admin' : 'Write Tools';

    useEffect(() => {
        const onClick = (event) => {
            if (!ref.current?.contains(event.target)) {
                setIsOpen(false);
            }
        };

        window.addEventListener('mousedown', onClick);

        return () => {
            window.removeEventListener('mousedown', onClick);
        };
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-xl border border-(--color-border-primary) px-3 py-2 text-sm font-medium transition-colors ${
                    isOpen
                        ? 'bg-(--color-bg-active) text-(--color-text-primary)'
                        : 'bg-(--color-bg-primary) text-(--color-text-secondary) hover:text-(--color-text-primary) hover:border-(--color-border-hover)'
                }`}
            >
                <span>{label}</span>
                <AppIcon
                    name="chevron-down"
                    className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-(--color-border-primary) bg-(--color-bg-primary)/96 backdrop-blur-xl shadow-(--shadow-lg) p-2 z-40">
                    {links.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-(--color-text-secondary) hover:bg-(--color-bg-secondary) hover:text-(--color-text-primary) transition-colors"
                        >
                            <AppIcon
                                name={item.icon}
                                className="h-4 w-4 text-(--color-brand-primary)"
                            />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function PageHeader({
    title,
    subtitle,
    backLink = null,
    actions = null,
    mode = null,
}) {
    const page = usePage();
    const currentUrl = page?.url || '';

    const headerMode =
        mode ||
        (currentUrl.startsWith('/admin')
            ? 'admin'
            : currentUrl.startsWith('/vendor')
              ? 'vendor'
              : null);

    return (
        <header className="sticky top-0 z-40 min-h-[73px] bg-(--color-bg-primary)/85 backdrop-blur-xl border-b border-(--color-border-primary) px-4 sm:px-6 md:px-8 py-3">
            <div className="w-full flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                    {backLink && (
                        <Link
                            href={backLink}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-(--color-text-tertiary) hover:text-(--color-text-primary) hover:bg-(--color-bg-hover) transition-colors"
                        >
                            <AppIcon name="chevron-down" className="h-4 w-4 -rotate-90" />
                            Back
                        </Link>
                    )}
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-(--color-text-primary) tracking-tight">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-(--color-text-tertiary) text-sm mt-1">{subtitle}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap md:justify-end">
                    {headerMode && <HeaderToolsMenu mode={headerMode} />}
                    <ThemeSwitcher compact />
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
            </div>
        </header>
    );
}
