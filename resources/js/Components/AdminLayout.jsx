import { Head, usePage } from '@inertiajs/react';
import React from 'react';
import AppIcon from './AppIcon';
import Sidebar from './Sidebar';

// =====================================
// ADMIN LAYOUT - Professional Design
// =====================================
export default function AdminLayout({
    children,
    title = 'Admin',
    activeNav = 'Dashboard',
    header = null,
    badges = {},
}) {
    const { flash = {} } = usePage().props;

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
                    variant="admin"
                    badges={badges}
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
                    </div>

                    {header}

                    {/* Flash Messages */}
                    {(flash?.success || flash?.error) && (
                        <div className="px-4 md:px-8 pt-6">
                            {flash.success && (
                                <div className="p-4 rounded-xl bg-(--color-success-light) border border-(--color-success) text-(--color-success-dark) flex items-center gap-3 shadow-token-sm">
                                    <span className="w-6 h-6 rounded-full bg-(--color-success) text-white flex items-center justify-center text-sm font-bold min-w-[24px]">
                                        <AppIcon name="success" className="h-4 w-4" />
                                    </span>
                                    <span className="font-medium text-sm">{flash.success}</span>
                                </div>
                            )}
                            {flash.error && (
                                <div className="p-4 rounded-xl bg-(--color-danger-light) border border-(--color-danger) text-(--color-danger-dark) flex items-center gap-3 shadow-token-sm">
                                    <span className="w-6 h-6 rounded-full bg-(--color-danger) text-white flex items-center justify-center text-sm font-bold min-w-[24px]">
                                        <AppIcon name="error" className="h-4 w-4" />
                                    </span>
                                    <span className="font-medium text-sm">{flash.error}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="p-4 md:p-8">{children}</div>
                </main>
            </div>
        </>
    );
}
