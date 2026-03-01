import { Head, usePage } from '@inertiajs/react';
import React from 'react';
import AppIcon from './AppIcon';
import Sidebar from './Sidebar';

// =====================================
// VENDOR LAYOUT - Light Theme
// =====================================
export default function VendorLayout({
    children,
    title = 'Vendor Portal',
    activeNav = 'Dashboard',
    header = null,
    badges = {},
}) {
    const { auth, flash } = usePage().props;
    const vendor = auth?.user?.vendor;

    // Show onboarding in nav if vendor not complete
    const customNav =
        vendor?.status === 'draft'
            ? [
                  { name: 'Complete Onboarding', icon: 'onboarding', href: '/vendor/onboarding' },
                  { name: 'Dashboard', icon: 'dashboard', href: '/vendor/dashboard' },
                  { name: 'Documents', icon: 'documents', href: '/vendor/documents' },
                  { name: 'Payments', icon: 'payments', href: '/vendor/payments' },
              ]
            : null;

    const statusBanners = {
        draft: {
            bg: 'bg-(--color-warning-light) border-b border-(--color-warning)',
            text: 'text-(--color-warning-dark)',
            icon: 'warning',
            message: 'Please complete your onboarding to start using VendorFlow',
        },
        submitted: {
            bg: 'bg-(--color-info-light)/70 border-b border-(--color-border-primary)',
            text: 'text-(--color-info-dark)',
            icon: 'clock',
            message: 'Your application is under review',
        },
        approved: {
            bg: 'bg-(--color-success-light) border-b border-(--color-success)',
            text: 'text-(--color-success-dark)',
            icon: 'success',
            message: 'Your application is approved. Awaiting activation.',
        },
        suspended: {
            bg: 'bg-(--color-danger-light) border-b border-(--color-danger)',
            text: 'text-(--color-danger-dark)',
            icon: 'error',
            message: 'Your account is currently suspended',
        },
    };

    const currentBanner =
        vendor && vendor.status !== 'active' ? statusBanners[vendor.status] : null;

    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    return (
        <>
            <Head title={title} />
            <div className="app-shell min-h-screen bg-(--color-bg-secondary) flex">
                <div className="animated-backdrop" aria-hidden="true">
                    <div className="animated-backdrop__grid" />
                </div>
                <Sidebar
                    activeItem={activeNav}
                    variant="vendor"
                    badges={badges}
                    customNav={customNav}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
                <main className="flex-1 w-full md:pl-64 transition-all">
                    {/* Mobile Header */}
                    <div className="md:hidden h-[73px] border-b border-(--color-border-primary) bg-(--color-bg-primary)/90 backdrop-blur-xl flex items-center px-5 justify-between sticky top-0 z-30">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 -ml-2 rounded-lg text-(--color-text-secondary) hover:bg-(--color-bg-hover)"
                            >
                                <AppIcon name="menu" className="w-6 h-6" fallback="Menu" />
                            </button>
                            <span className="font-bold text-(--color-text-primary) tracking-tight">
                                {title}
                            </span>
                        </div>
                        {/* Vendor status dot for mobile */}
                        {vendor && (
                            <div
                                className={`w-3 h-3 rounded-full ${
                                    vendor.status === 'active'
                                        ? 'bg-(--color-success)'
                                        : 'bg-(--color-warning)'
                                }`}
                            />
                        )}
                    </div>

                    {/* Vendor Status Banner */}
                    {currentBanner && (
                        <div
                            className={`px-4 md:px-8 py-4 text-center text-sm font-medium ${currentBanner.bg} ${currentBanner.text} animate-slide-left`}
                        >
                            <span className="inline-flex items-center gap-2">
                                <AppIcon
                                    name={currentBanner.icon}
                                    className="h-5 w-5"
                                    fallback={
                                        <span className="text-lg leading-none">
                                            {currentBanner.icon}
                                        </span>
                                    }
                                />
                                {currentBanner.message}
                            </span>
                        </div>
                    )}

                    {header}

                    {/* Flash Messages */}
                    {(flash?.success || flash?.error) && (
                        <div className="px-4 md:px-8 pt-4 animate-scale-in">
                            {flash.success && (
                                <div className="p-4 rounded-xl bg-(--color-success-light) border border-(--color-success) text-(--color-success-dark) flex items-center gap-3 shadow-token-md">
                                    <span className="w-6 h-6 rounded-full bg-(--color-success) text-white flex items-center justify-center min-w-[24px]">
                                        <AppIcon
                                            name="success"
                                            className="h-4 w-4"
                                            strokeWidth={2.2}
                                        />
                                    </span>
                                    <span className="font-medium text-sm">{flash.success}</span>
                                </div>
                            )}
                            {flash.error && (
                                <div className="p-4 rounded-xl bg-(--color-danger-light) border border-(--color-danger) text-(--color-danger-dark) flex items-center gap-3 shadow-token-md">
                                    <span className="w-6 h-6 rounded-full bg-(--color-danger) text-white flex items-center justify-center min-w-[24px]">
                                        <AppIcon
                                            name="error"
                                            className="h-4 w-4"
                                            strokeWidth={2.2}
                                        />
                                    </span>
                                    <span className="font-medium text-sm">{flash.error}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="p-4 md:p-8 animate-fade-in">{children}</div>
                </main>
            </div>
        </>
    );
}
