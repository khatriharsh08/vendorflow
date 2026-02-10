import { Link } from '@inertiajs/react';
import Logo from './Logo';

const defaultLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
];

const socialLinks = [
    { icon: '𝕏', href: '#', label: 'Twitter' },
    { icon: '📘', href: '#', label: 'Facebook' },
    { icon: '💼', href: '#', label: 'LinkedIn' },
];

export default function Footer({ links = defaultLinks, showSocial = true, className = '' }) {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            className={`border-t border-(--color-border-primary) bg-(--color-bg-primary) ${className}`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <Logo size="2xl" light={true} linkToHome={false} />
                        </div>
                        <p className="text-(--color-text-tertiary) text-sm max-w-md">
                            A comprehensive multi-vendor operations and compliance platform. Manage
                            vendors, documents, payments, and compliance all in one place.
                        </p>
                        {showSocial && (
                            <div className="flex gap-4 mt-4">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        className="w-10 h-10 rounded-xl bg-(--color-bg-secondary) border border-(--color-border-secondary) flex items-center justify-center text-(--color-text-tertiary) hover:text-(--color-brand-primary) hover:border-(--color-brand-primary-light) transition-all"
                                        aria-label={social.label}
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-(--color-text-primary) font-semibold mb-4">
                            Quick Links
                        </h3>
                        <ul className="space-y-2">
                            {links.slice(0, 5).map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-(--color-text-tertiary) hover:text-(--color-brand-primary) text-sm transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-(--color-text-primary) font-semibold mb-4">Contact</h3>
                        <ul className="space-y-2 text-sm text-(--color-text-tertiary)">
                            <li className="flex items-center gap-2">
                                <span>📧</span> support@vendorflow.com
                            </li>
                            <li className="flex items-center gap-2">
                                <span>📞</span> +91 123 456 7890
                            </li>
                            <li className="flex items-center gap-2">
                                <span>📍</span> Mumbai, India
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-(--color-border-primary) mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-(--color-text-muted) text-sm">
                        © {currentYear} VendorFlow. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <Link
                            href="/privacy"
                            className="text-(--color-text-tertiary) hover:text-(--color-brand-primary) transition-colors"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-(--color-text-tertiary) hover:text-(--color-brand-primary) transition-colors"
                        >
                            Terms
                        </Link>
                        <Link
                            href="/cookies"
                            className="text-(--color-text-tertiary) hover:text-(--color-brand-primary) transition-colors"
                        >
                            Cookies
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// Minimal footer for internal pages
export function FooterMinimal() {
    return (
        <footer className="border-t border-(--color-border-primary) py-4 bg-(--color-bg-primary)">
            <div className="max-w-7xl mx-auto px-4 text-center text-(--color-text-muted) text-sm">
                © {new Date().getFullYear()} VendorFlow. Built with ❤️
            </div>
        </footer>
    );
}
