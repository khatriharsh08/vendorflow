import { Head, usePage } from '@inertiajs/react';
import Sidebar from './Sidebar';

// =====================================
// VENDOR LAYOUT - Light Theme
// =====================================
export default function VendorLayout({ 
    children, 
    title = 'Vendor Portal', 
    activeNav = 'Dashboard',
    header = null,
    badges = {}
}) {
    const { auth, flash } = usePage().props;
    const vendor = auth?.user?.vendor;

    // Show onboarding in nav if vendor not complete
    const customNav = vendor?.status === 'draft' ? [
        { name: 'Complete Onboarding', icon: '📝', href: '/vendor/onboarding' },
        { name: 'Dashboard', icon: '🏠', href: '/vendor/dashboard' },
        { name: 'Documents', icon: '📄', href: '/vendor/documents' },
        { name: 'Payments', icon: '💰', href: '/vendor/payments' },
    ] : null;

    const statusBanners = {
        draft: {
            bg: 'bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200',
            text: 'text-amber-700',
            icon: '⚠️',
            message: 'Please complete your onboarding to start using VendorFlow'
        },
        submitted: {
            bg: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200',
            text: 'text-blue-700',
            icon: '⏳',
            message: 'Your application is under review'
        },
        approved: {
            bg: 'bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200',
            text: 'text-emerald-700',
            icon: '✅',
            message: 'Your application is approved. Awaiting activation.'
        },
        suspended: {
            bg: 'bg-gradient-to-r from-rose-50 to-red-50 border-b border-rose-200',
            text: 'text-rose-700',
            icon: '🚫',
            message: 'Your account is currently suspended'
        }
    };

    const currentBanner = vendor && vendor.status !== 'active' ? statusBanners[vendor.status] : null;

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/30 flex">
                <Sidebar 
                    activeItem={activeNav} 
                    variant="vendor" 
                    badges={badges}
                    customNav={customNav}
                />
                <main className="flex-1 pl-64">
                    {/* Vendor Status Banner */}
                    {currentBanner && (
                        <div className={`px-8 py-4 text-center text-sm font-medium ${currentBanner.bg} ${currentBanner.text} animate-slide-left`}>
                            <span className="inline-flex items-center gap-2">
                                <span className="text-lg">{currentBanner.icon}</span>
                                {currentBanner.message}
                            </span>
                        </div>
                    )}
                    
                    {header}
                    
                    {/* Flash Messages */}
                    {(flash?.success || flash?.error) && (
                        <div className="px-8 pt-4 animate-scale-in">
                            {flash.success && (
                                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-700 flex items-center gap-3 shadow-lg shadow-emerald-100">
                                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm">✓</span>
                                    <span className="font-medium">{flash.success}</span>
                                </div>
                            )}
                            {flash.error && (
                                <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 text-rose-700 flex items-center gap-3 shadow-lg shadow-rose-100">
                                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-sm">✗</span>
                                    <span className="font-medium">{flash.error}</span>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="p-8 animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
}
