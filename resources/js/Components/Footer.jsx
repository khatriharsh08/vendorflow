import { Link } from '@inertiajs/react';
import AppIcon from './AppIcon';
import Logo from './Logo';

const defaultLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
];

const toolLinks = [
    { label: 'Write Tools', href: '/vendor/onboarding' },
    { label: 'Documents', href: '/vendor/documents' },
    { label: 'Payments', href: '/vendor/payments' },
    { label: 'Compliance', href: '/vendor/compliance' },
];

const adminLinks = [
    { label: 'Admin Dashboard', href: '/admin/dashboard' },
    { label: 'Vendor Admin', href: '/admin/vendors' },
    { label: 'Payments Admin', href: '/admin/payments' },
    { label: 'Reports Admin', href: '/admin/reports' },
];

export default function Footer({ links = defaultLinks, showSocial = true, className = '' }) {
    const year = new Date().getFullYear();

    return (
        <footer
            className={`mt-12 border-t border-(--color-border-primary) bg-(--color-bg-primary)/80 backdrop-blur-xl ${className}`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-5">
                        <div className="mb-4">
                            <Logo size="xl" light={true} linkToHome={false} />
                        </div>
                        <p className="max-w-md text-sm text-(--color-text-tertiary)">
                            VendorFlow keeps vendor onboarding, compliance, documents, and payments
                            in one clean workspace.
                        </p>

                        {showSocial && (
                            <div className="mt-5 flex items-center gap-2">
                                <a
                                    href="mailto:support@vendorflow.com"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-(--color-border-primary) text-(--color-text-tertiary) hover:text-(--color-brand-primary) hover:border-(--color-border-hover) transition-colors"
                                    aria-label="Email support"
                                >
                                    <AppIcon name="messages" className="h-4 w-4" />
                                </a>
                                <a
                                    href="/contact"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-(--color-border-primary) text-(--color-text-tertiary) hover:text-(--color-brand-primary) hover:border-(--color-border-hover) transition-colors"
                                    aria-label="Contact page"
                                >
                                    <AppIcon name="profile" className="h-4 w-4" />
                                </a>
                                <a
                                    href="/about"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-(--color-border-primary) text-(--color-text-tertiary) hover:text-(--color-brand-primary) hover:border-(--color-border-hover) transition-colors"
                                    aria-label="About page"
                                >
                                    <AppIcon name="info" className="h-4 w-4" />
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <h3 className="text-sm font-semibold text-(--color-text-primary) mb-3">
                            Company
                        </h3>
                        <div className="space-y-2">
                            {links.slice(0, 5).map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="block text-sm text-(--color-text-tertiary) hover:text-(--color-brand-primary) transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <h3 className="text-sm font-semibold text-(--color-text-primary) mb-3">
                            Create Tools
                        </h3>
                        <div className="space-y-2">
                            {toolLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="block text-sm text-(--color-text-tertiary) hover:text-(--color-brand-primary) transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-3">
                        <h3 className="text-sm font-semibold text-(--color-text-primary) mb-3">
                            Admin
                        </h3>
                        <div className="space-y-2">
                            {adminLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="block text-sm text-(--color-text-tertiary) hover:text-(--color-brand-primary) transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-(--color-border-secondary) flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-xs text-(--color-text-muted)">
                        (c) {year} VendorFlow. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-(--color-text-tertiary)">
                        <Link href="/privacy" className="hover:text-(--color-brand-primary)">
                            Privacy
                        </Link>
                        <Link href="/terms" className="hover:text-(--color-brand-primary)">
                            Terms
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export function FooterMinimal() {
    return (
        <footer className="border-t border-(--color-border-primary) bg-(--color-bg-primary)/80">
            <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-(--color-text-muted)">
                (c) {new Date().getFullYear()} VendorFlow.
            </div>
        </footer>
    );
}
