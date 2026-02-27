import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppIcon from './AppIcon';
import Logo from './Logo';

// =====================================
// SIDEBAR CONFIGURATION
// =====================================
const adminNavConfig = [
    { name: 'Dashboard', icon: 'dashboard', href: '/admin/dashboard' },
    { name: 'Vendors', icon: 'vendors', href: '/admin/vendors' },
    {
        name: 'Documents',
        icon: 'documents',
        href: '/admin/documents',
        permission: 'verify_documents',
        allowedRoles: ['ops_manager', 'super_admin'],
    },
    {
        name: 'Compliance',
        icon: 'compliance',
        href: '/admin/compliance',
        permission: 'run_compliance',
        allowedRoles: ['ops_manager', 'super_admin'],
    },
    {
        name: 'Performance',
        icon: 'performance',
        href: '/admin/performance',
        permission: 'rate_vendors',
        allowedRoles: ['ops_manager', 'super_admin'],
    },
    { name: 'Payments', icon: 'payments', href: '/admin/payments' },
    { name: 'Audit Logs', icon: 'audit', href: '/admin/audit', permission: 'view_audit' },
    {
        name: 'Staff Users',
        icon: 'staff',
        href: '/admin/staff-users',
        permission: 'view_audit',
    },
    {
        name: 'Messages',
        icon: 'messages',
        href: '/admin/contact-messages',
        permission: 'view_messages',
        allowedRoles: ['ops_manager', 'super_admin'],
    },
    { name: 'Reports', icon: 'reports', href: '/admin/reports', permission: 'view_reports' },
    {
        name: 'System Health',
        icon: 'system',
        href: '/admin/system-health',
        permission: 'view_reports',
    },
];

const vendorNavConfig = [
    { name: 'Dashboard', icon: 'dashboard', href: '/vendor/dashboard' },
    { name: 'Profile', icon: 'profile', href: '/vendor/profile' },
    { name: 'Documents', icon: 'documents', href: '/vendor/documents' },
    { name: 'Compliance', icon: 'compliance', href: '/vendor/compliance' },
    { name: 'Performance', icon: 'performance', href: '/vendor/performance' },
    { name: 'Payments', icon: 'payments', href: '/vendor/payments' },
    { name: 'Notifications', icon: 'notifications', href: '/vendor/notifications' },
];

function IconRenderer({ icon, size = 'h-5 w-5' }) {
    return (
        <AppIcon
            name={icon}
            className={size}
            fallback={<span className="text-xs font-semibold uppercase tracking-wide">{icon}</span>}
        />
    );
}

// =====================================
// USER MENU DROPDOWN COMPONENT
// =====================================
function UserMenu({ user, roleDisplay, onLogout }) {
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { name: 'Profile', icon: 'profile', href: '/profile' },
        { name: 'Notifications', icon: 'notifications', href: '/notifications' },
        { name: 'Settings', icon: 'settings', href: '/profile' },
    ];

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-(--color-bg-hover) transition-colors group"
                aria-expanded={isOpen}
                aria-label="Toggle user menu"
            >
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                    style={{
                        background: 'var(--gradient-primary)',
                        boxShadow: 'var(--shadow-primary)',
                    }}
                >
                    {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-semibold text-(--color-text-primary) truncate">
                        {user?.name || 'User'}
                    </div>
                    <div className="text-xs text-(--color-brand-primary) truncate capitalize font-medium">
                        {roleDisplay}
                    </div>
                </div>
                <svg
                    className={`w-4 h-4 text-(--color-text-muted) transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
                <div className="absolute bottom-full left-0 right-0 mb-2 py-1.5 bg-(--color-bg-primary) rounded-xl border border-(--color-border-primary) shadow-(--shadow-xl)">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-2.5 text-(--color-text-secondary) hover:text-(--color-brand-primary) hover:bg-(--color-bg-hover) transition-colors text-sm font-medium"
                        >
                            <IconRenderer icon={item.icon} size="h-4 w-4" />
                            {item.name}
                        </Link>
                    ))}
                    <div className="border-t border-(--color-border-secondary) my-1.5" />
                    <button
                        type="button"
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-(--color-danger) hover:bg-(--color-danger-light) transition-colors text-sm font-medium"
                    >
                        <IconRenderer icon="logout" size="h-4 w-4" />
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
                        ? 'text-white'
                        : 'text-(--color-text-secondary) hover:bg-(--color-bg-hover) hover:text-(--color-text-primary)'
                }
            `}
            style={
                isActive
                    ? { background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-primary)' }
                    : undefined
            }
        >
            <span className="w-6 flex justify-center">
                <IconRenderer icon={item.icon} />
            </span>
            <span>{item.name}</span>
            {item.badge && (
                <span
                    className={`
                    ml-auto px-2 py-0.5 rounded-full text-xs font-semibold
                    ${
                        isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-(--color-brand-primary-light) text-(--color-brand-primary)'
                    }
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
    isOpen = false,
    onClose = () => {},
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
        .filter((item) => {
            const hasPermission = !item.permission || can[item.permission];
            const hasRoleAccess =
                !item.allowedRoles || item.allowedRoles.some((role) => roles.includes(role));

            return hasPermission && hasRoleAccess;
        })
        .map((item) => ({
            ...item,
            badge: badges[item.name] || null,
        }));

    const roleDisplay =
        roles.length > 0 ? roles.map((role) => role.replace(/_/g, ' ')).join(', ') : 'Staff';

    const logoText = variant === 'vendor' ? 'Vendor Portal' : 'Admin Panel';

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed left-0 top-0 bottom-0 w-64 bg-(--color-bg-primary) border-r border-(--color-border-primary) flex flex-col z-50
                    transition-transform duration-300 ease-in-out
                    md:translate-x-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Logo - matches PageHeader height */}
                <div className="h-[73px] px-5 border-b border-(--color-border-primary) flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <Logo size="xl" light={true} linkToHome={false} />
                        <div className="h-8 w-px bg-(--color-border-primary) mx-1"></div>
                        <div className="flex flex-col justify-center">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-(--color-text-muted) group-hover:text-(--color-brand-primary) transition-colors">
                                {logoText.split(' ')[0]}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-(--color-text-muted) opacity-70 group-hover:text-(--color-brand-secondary) transition-colors">
                                {logoText.split(' ')[1]}
                            </span>
                        </div>
                    </Link>
                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="md:hidden text-(--color-text-muted) hover:text-(--color-text-primary)"
                    >
                        <AppIcon name="close" className="w-5 h-5" fallback="X" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {visibleItems.map((item) => (
                        <NavItem key={item.name} item={item} isActive={activeItem === item.name} />
                    ))}
                </nav>

                {/* User Section */}
                <div className="p-3 border-t border-(--color-border-primary)">
                    <UserMenu user={user} roleDisplay={roleDisplay} onLogout={handleLogout} />
                </div>
            </aside>
        </>
    );
}

export { NavItem, UserMenu, adminNavConfig, vendorNavConfig };
