import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AppIcon from './AppIcon';
import Logo from './Logo';
import ThemeSwitcher from './ThemeSwitcher';

const mainLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
];

const createToolsLinks = [
    {
        label: 'Write Tools',
        description: 'Start vendor onboarding',
        href: '/vendor/onboarding',
        icon: 'onboarding',
    },
    {
        label: 'Document Tools',
        description: 'Manage vendor files',
        href: '/vendor/documents',
        icon: 'documents',
    },
    {
        label: 'Payment Tools',
        description: 'Submit payment requests',
        href: '/vendor/payments',
        icon: 'payments',
    },
    {
        label: 'Compliance Tools',
        description: 'Track compliance status',
        href: '/vendor/compliance',
        icon: 'compliance',
    },
];

function MenuDropdown({ id, label, items, activeDropdown, setActiveDropdown }) {
    const isOpen = activeDropdown === id;

    const close = () => setActiveDropdown(null);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setActiveDropdown(isOpen ? null : id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isOpen
                        ? 'bg-(--color-bg-active) text-(--color-text-primary)'
                        : 'text-(--color-text-tertiary) hover:bg-(--color-bg-hover) hover:text-(--color-text-primary)'
                }`}
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <span>{label}</span>
                <AppIcon
                    name="chevron-down"
                    className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div
                    className="absolute left-0 mt-2 w-72 rounded-2xl border border-(--color-border-primary) bg-(--color-bg-primary)/96 backdrop-blur-xl p-2 shadow-token-lg z-50"
                    role="menu"
                >
                    {items.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={close}
                            className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-(--color-bg-secondary) transition-colors"
                            role="menuitem"
                        >
                            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--color-bg-tertiary) text-(--color-brand-primary)">
                                <AppIcon name={item.icon} className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                                <span className="block text-sm font-semibold text-(--color-text-primary)">
                                    {item.label}
                                </span>
                                <span className="block text-xs text-(--color-text-tertiary)">
                                    {item.description}
                                </span>
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Navbar({
    variant = 'glass', // transparent, solid, glass
    actions = null,
    className = '',
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const navRef = useRef(null);

    useEffect(() => {
        const onClick = (event) => {
            if (!navRef.current?.contains(event.target)) {
                setActiveDropdown(null);
                setIsMobileOpen(false);
            }
        };

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                setActiveDropdown(null);
                setIsMobileOpen(false);
            }
        };

        window.addEventListener('mousedown', onClick);
        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('mousedown', onClick);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, []);

    const variants = {
        transparent: 'bg-transparent',
        solid: 'bg-(--color-bg-primary)',
        glass: 'bg-(--color-bg-primary)/80 backdrop-blur-xl',
    };

    return (
        <nav
            ref={navRef}
            className={`sticky top-0 z-50 border-b border-(--color-border-primary) ${variants[variant]} ${className}`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-3">
                        <Logo size="lg" light={true} linkToHome={false} />
                    </Link>

                    <div className="hidden lg:flex items-center gap-1">
                        {mainLinks.map((item) => (
                            <NavLink key={item.href} href={item.href}>
                                {item.label}
                            </NavLink>
                        ))}

                        <MenuDropdown
                            id="create-tools"
                            label="Create Tools"
                            items={createToolsLinks}
                            activeDropdown={activeDropdown}
                            setActiveDropdown={setActiveDropdown}
                        />

                        {actions && <div className="ml-2">{actions}</div>}
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeSwitcher compact />

                        {user ? (
                            <>
                                <Link
                                    href="/notifications"
                                    className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-(--color-border-primary) text-(--color-text-tertiary) hover:text-(--color-text-primary) hover:border-(--color-border-hover) transition-colors"
                                    aria-label="Notifications"
                                >
                                    <AppIcon name="notifications" className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="btn-primary hidden sm:inline-flex"
                                >
                                    Dashboard
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="btn-primary hidden sm:inline-flex"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}

                        <button
                            type="button"
                            className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border border-(--color-border-primary) text-(--color-text-secondary) hover:text-(--color-text-primary) hover:border-(--color-border-hover) transition-colors"
                            onClick={() =>
                                setIsMobileOpen((prev) => {
                                    const next = !prev;

                                    if (next) {
                                        setActiveDropdown(null);
                                    }

                                    return next;
                                })
                            }
                            aria-expanded={isMobileOpen}
                            aria-label="Toggle navigation"
                        >
                            <AppIcon name={isMobileOpen ? 'close' : 'menu'} className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {isMobileOpen && (
                <div className="lg:hidden border-t border-(--color-border-primary) bg-(--color-bg-primary)/95 backdrop-blur-xl">
                    <div className="px-4 py-4 space-y-4">
                        <div className="space-y-1">
                            {mainLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="block rounded-lg px-3 py-2 text-sm text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-bg-hover)"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        <div className="rounded-xl border border-(--color-border-secondary) p-2">
                            <p className="px-2 pb-1 text-xs uppercase tracking-wide text-(--color-text-muted)">
                                Create Tools
                            </p>
                            {createToolsLinks.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-(--color-text-secondary) hover:bg-(--color-bg-hover)"
                                >
                                    <AppIcon name={item.icon} className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </div>

                        {!user && (
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    href="/login"
                                    className="btn-secondary justify-center text-center"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="btn-primary justify-center text-center"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

export function NavLink({ href, children }) {
    return (
        <Link
            href={href}
            className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-(--color-text-tertiary) hover:text-(--color-text-primary) hover:bg-(--color-bg-hover) transition-colors"
        >
            {children}
        </Link>
    );
}
