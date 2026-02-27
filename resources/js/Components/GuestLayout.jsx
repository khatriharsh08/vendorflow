import { Head } from '@inertiajs/react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function GuestLayout({
    children,
    title = 'VendorFlow',
    showNavbar = true,
    showFooter = true,
    navbarVariant = 'glass',
}) {
    return (
        <>
            <Head title={title} />
            <div className="app-shell min-h-screen bg-(--color-bg-secondary) flex flex-col">
                <div className="animated-backdrop" aria-hidden="true">
                    <div className="animated-backdrop__grid" />
                </div>
                {showNavbar && <Navbar variant={navbarVariant} />}
                <main className="flex-1">{children}</main>
                {showFooter && <Footer />}
            </div>
        </>
    );
}

// Auth layout for login/register pages - Light theme
export function AuthLayout({ children, title = 'VendorFlow' }) {
    return (
        <>
            <Head title={title} />
            <div className="app-shell min-h-screen bg-(--gradient-page) flex items-center justify-center p-4">
                <div className="animated-backdrop" aria-hidden="true">
                    <div className="animated-backdrop__grid" />
                </div>
                <div className="w-full max-w-md">{children}</div>
            </div>
        </>
    );
}
