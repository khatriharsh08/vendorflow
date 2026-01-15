import { Head, usePage } from '@inertiajs/react';
import Sidebar from './Sidebar';

// =====================================
// ADMIN LAYOUT - Professional Design
// =====================================
export default function AdminLayout({ 
    children, 
    title = 'Admin', 
    activeNav = 'Dashboard',
    header = null,
    badges = {}
}) {
    const { flash } = usePage().props;

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 flex">
                <Sidebar activeItem={activeNav} variant="admin" badges={badges} />
                <main className="flex-1 pl-64">
                    {header}
                    
                    {/* Flash Messages */}
                    {(flash?.success || flash?.error) && (
                        <div className="px-8 pt-6">
                            {flash.success && (
                                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-3 shadow-sm">
                                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">✓</span>
                                    <span className="font-medium">{flash.success}</span>
                                </div>
                            )}
                            {flash.error && (
                                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 shadow-sm">
                                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-sm font-bold">✗</span>
                                    <span className="font-medium">{flash.error}</span>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
}
