import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Logo from './Logo';

// =====================================
// SIDEBAR CONFIGURATION
// =====================================
const adminNavConfig = [
    { name: 'Dashboard', icon: '🏠', href: '/admin/dashboard' },
    { name: 'Vendors', icon: '🏢', href: '/admin/vendors' },
    { name: 'Documents', icon: '📄', href: '/admin/documents', permission: 'verify_documents' },
    { name: 'Compliance', icon: '🛡️', href: '/admin/compliance' },
    { name: 'Performance', icon: '📈', href: '/admin/performance', permission: 'rate_vendors' },
    { name: 'Payments', icon: '💰', href: '/admin/payments' },
    { name: 'Audit Logs', icon: '📋', href: '/admin/audit', permission: 'view_audit' },
    { name: 'Messages', icon: '📩', href: '/admin/contact-messages' },
    { name: 'Reports', icon: '📊', href: '/admin/reports', permission: 'view_reports' },
];

const vendorNavConfig = [
    { name: 'Dashboard', icon: '🏠', href: '/vendor/dashboard' },
    { name: 'Profile', icon: '👤', href: '/vendor/profile' },
    { name: 'Documents', icon: '📄', href: '/vendor/documents' },
    { name: 'Compliance', icon: '🛡️', href: '/vendor/compliance' },
    { name: 'Performance', icon: '📈', href: '/vendor/performance' },
    { name: 'Payments', icon: '💰', href: '/vendor/payments' },
    { name: 'Notifications', icon: '🔔', href: '/vendor/notifications' },
];

// =====================================
// USER MENU DROPDOWN COMPONENT
// =====================================
function UserMenu({ user, roleDisplay, onLogout }) {
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { name: 'Profile', icon: '👤', href: '/profile' },
        { name: 'Notifications', icon: '🔔', href: '/notifications' },
        { name: 'Settings', icon: '⚙️', href: '/profile' },
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
            >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-200">
                    {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                        {user?.name || 'User'}
                    </div>
                    <div className="text-xs text-indigo-600 truncate capitalize font-medium">
                        {roleDisplay}
                    </div>
                </div>
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 py-1.5 bg-white rounded-xl border border-gray-100 shadow-xl">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors text-sm font-medium"
                        >
                            <span className="text-base">{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}
                    <div className="border-t border-gray-100 my-1.5" />
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-600 hover:bg-rose-50/50 transition-colors text-sm font-medium"
                    >
                        <span className="text-base">🚪</span>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}

// =====================================
// NAV ITEM COMPONENT
// =====================================
function NavItem({ item, isActive }) {
    return (
        <Link
            href={item.href}
            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200
                ${
                    isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
            `}
        >
            <span className="text-lg w-6 text-center">{item.icon}</span>
            <span>{item.name}</span>
            {item.badge && (
                <span
                    className={`
                    ml-auto px-2 py-0.5 rounded-full text-xs font-semibold
                    ${isActive ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'}
                `}
                >
                    {item.badge}
                </span>
            )}
        </Link>
    );
}

// =====================================
// MAIN SIDEBAR COMPONENT
// =====================================
export default function Sidebar({
    activeItem = 'Dashboard',
    variant = 'admin',
    customNav = null,
    badges = {},
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const can = auth?.can || {};
    const roles = auth?.roles || [];

    const handleLogout = (e) => {
        e?.preventDefault();
        router.post('/logout');
    };

    const navConfig = customNav || (variant === 'vendor' ? vendorNavConfig : adminNavConfig);

    const visibleItems = navConfig
        .filter((item) => !item.permission || can[item.permission])
        .map((item) => ({
            ...item,
            badge: badges[item.name] || null,
        }));

    const roleDisplay =
        roles.length > 0 ? roles.map((r) => r.replace('_', ' ')).join(', ') : 'Staff';

    const logoGradient =
        variant === 'vendor' ? 'from-emerald-500 to-teal-600' : 'from-indigo-500 to-violet-600';

    const logoText = variant === 'vendor' ? 'Vendor Portal' : 'Admin Panel';

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 flex flex-col z-50">
            {/* Logo - matches PageHeader height */}
            <div className="h-[73px] px-5 border-b border-gray-100 flex items-center">
                <Link href="/" className="flex items-center gap-3 group">
                    <Logo size="xl" light={true} linkToHome={false} />
                    <div className="h-8 w-px bg-gray-100 mx-1"></div>
                    <div className="flex flex-col justify-center">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 group-hover:text-indigo-600 transition-colors">
                            {logoText.split(' ')[0]}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-300 group-hover:text-indigo-400 transition-colors">
                            {logoText.split(' ')[1]}
                        </span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {visibleItems.map((item) => (
                    <NavItem key={item.name} item={item} isActive={activeItem === item.name} />
                ))}
            </nav>

            {/* User Section */}
            <div className="p-3 border-t border-gray-100">
                <UserMenu user={user} roleDisplay={roleDisplay} onLogout={handleLogout} />
            </div>
        </aside>
    );
}

export { NavItem, UserMenu, adminNavConfig, vendorNavConfig };
