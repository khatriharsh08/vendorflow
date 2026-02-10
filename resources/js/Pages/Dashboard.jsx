import { Head, Link, usePage, router } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth?.user;

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    // Stats data (would come from backend in real app)
    const stats = [
        {
            label: 'Total Vendors',
            value: '128',
            icon: '🏢',
            change: '+12%',
            color: 'from-blue-500 to-cyan-400',
        },
        {
            label: 'Active',
            value: '94',
            icon: '✅',
            change: '+5%',
            color: 'from-green-500 to-emerald-400',
        },
        {
            label: 'Pending Review',
            value: '23',
            icon: '⏳',
            change: '-3%',
            color: 'from-yellow-500 to-orange-400',
        },
        {
            label: 'Non-Compliant',
            value: '11',
            icon: '⚠️',
            change: '+2',
            color: 'from-red-500 to-rose-400',
        },
    ];

    const recentActivities = [
        {
            action: 'Vendor Approved',
            vendor: 'TechCorp Solutions',
            user: 'Admin',
            time: '2 mins ago',
            type: 'success',
        },
        {
            action: 'Payment Requested',
            vendor: 'Global Services Ltd',
            user: 'Vendor',
            time: '15 mins ago',
            type: 'info',
        },
        {
            action: 'Document Expired',
            vendor: 'InfoSys Partners',
            user: 'System',
            time: '1 hour ago',
            type: 'warning',
        },
        {
            action: 'Vendor Suspended',
            vendor: 'DataFlow Inc',
            user: 'Admin',
            time: '3 hours ago',
            type: 'danger',
        },
    ];

    const pendingApprovals = [
        { type: 'Vendor Onboarding', name: 'CloudTech Systems', submitted: '2 days ago' },
        { type: 'Payment Request', name: 'Global Services Ltd', amount: '₹45,000' },
        { type: 'Document Verification', name: 'DataLink Corp', document: 'Tax Certificate' },
    ];

    return (
        <>
            <Head title="Dashboard" />
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
                {/* Sidebar */}
                <aside className="fixed left-0 top-0 bottom-0 w-64 glass-card border-r border-slate-800/50 p-6 flex flex-col">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </div>
                        <span className="text-xl font-bold gradient-text">VendorFlow</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        <a href="#" className="sidebar-item active">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                            </svg>
                            Dashboard
                        </a>
                        <a href="#" className="sidebar-item">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                            </svg>
                            Vendors
                        </a>
                        <a href="#" className="sidebar-item">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            Documents
                        </a>
                        <a href="#" className="sidebar-item">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                            </svg>
                            Compliance
                        </a>
                        <a href="#" className="sidebar-item">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            Payments
                        </a>
                        <a href="#" className="sidebar-item">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                            Reports
                        </a>
                    </nav>

                    {/* User Profile */}
                    <div className="pt-6 border-t border-slate-700/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-white truncate">
                                    {user?.name || 'User'}
                                </div>
                                <div className="text-xs text-slate-400 truncate">
                                    {user?.email || 'user@example.com'}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            Logout
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="pl-64">
                    {/* Header */}
                    <header className="sticky top-0 z-40 glass-card border-b border-slate-800/50 px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                                <p className="text-slate-400 text-sm">
                                    Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Notifications */}
                                <button className="relative p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                        />
                                    </svg>
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>
                                {/* Quick Add */}
                                <button className="btn-primary flex items-center gap-2">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>
                                    Add Vendor
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Dashboard Content */}
                    <div className="p-8 space-y-8">
                        {/* Stats Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="glass-card p-6 card-hover">
                                    <div className="flex items-start justify-between mb-4">
                                        <span className="text-3xl">{stat.icon}</span>
                                        <span
                                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                stat.change.startsWith('+')
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400'
                                            }`}
                                        >
                                            {stat.change}
                                        </span>
                                    </div>
                                    <div
                                        className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                                    >
                                        {stat.value}
                                    </div>
                                    <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Recent Activity */}
                            <div className="glass-card p-6">
                                <h2 className="text-lg font-semibold text-white mb-4">
                                    Recent Activity
                                </h2>
                                <div className="space-y-4">
                                    {recentActivities.map((activity, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-800/50 transition-colors"
                                        >
                                            <div
                                                className={`w-2 h-2 rounded-full ${
                                                    activity.type === 'success'
                                                        ? 'bg-green-400'
                                                        : activity.type === 'warning'
                                                          ? 'bg-yellow-400'
                                                          : activity.type === 'danger'
                                                            ? 'bg-red-400'
                                                            : 'bg-blue-400'
                                                }`}
                                            ></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-white text-sm">
                                                    {activity.action}
                                                </div>
                                                <div className="text-slate-400 text-xs truncate">
                                                    {activity.vendor}
                                                </div>
                                            </div>
                                            <div className="text-slate-500 text-xs">
                                                {activity.time}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pending Approvals */}
                            <div className="glass-card p-6">
                                <h2 className="text-lg font-semibold text-white mb-4">
                                    Pending Approvals
                                </h2>
                                <div className="space-y-4">
                                    {pendingApprovals.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-700/50"
                                        >
                                            <div>
                                                <div className="text-xs text-indigo-400 font-medium mb-1">
                                                    {item.type}
                                                </div>
                                                <div className="text-white text-sm">
                                                    {item.name}
                                                </div>
                                                <div className="text-slate-400 text-xs mt-1">
                                                    {item.submitted || item.amount || item.document}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </button>
                                                <button className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
