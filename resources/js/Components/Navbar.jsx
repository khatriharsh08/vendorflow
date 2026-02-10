import { Link, usePage } from '@inertiajs/react';
import Logo from './Logo';

export default function Navbar({
    variant = 'transparent', // transparent, solid, glass
    actions = null,
    className = '',
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const variants = {
        transparent: 'bg-transparent',
        solid: 'bg-(--color-bg-primary)',
        glass: 'bg-(--color-bg-primary)/80 backdrop-blur-xl',
    };

    return (
        <nav
            className={`sticky top-0 z-50 border-b border-(--color-border-primary) ${variants[variant]} ${className}`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <Logo size="2xl" light={true} linkToHome={false} />
                    </Link>

                    {/* Center Actions */}
                    {actions && <div className="hidden md:flex items-center gap-6">{actions}</div>}

                    {/* Right Side - Auth */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <Link
                                    href="/notifications"
                                    className="text-(--color-text-tertiary) hover:text-(--color-text-primary) transition-colors p-2"
                                >
                                    🔔
                                </Link>
                                <Link href="/dashboard" className="btn-primary">
                                    Dashboard
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors font-medium"
                                >
                                    Login
                                </Link>
                                <Link href="/register" className="btn-primary">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

// Simple nav link component for consistency
export function NavLink({ href, active = false, children }) {
    return (
        <Link
            href={href}
            className={`text-sm font-medium transition-colors ${
                active
                    ? 'text-(--color-text-primary)'
                    : 'text-(--color-text-tertiary) hover:text-(--color-text-primary)'
            }`}
        >
            {children}
        </Link>
    );
}
