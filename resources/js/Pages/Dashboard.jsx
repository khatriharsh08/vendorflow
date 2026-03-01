import { Link, usePage } from '@inertiajs/react';
import {
    AdminLayout,
    AppIcon,
    Badge,
    Card,
    PageHeader,
    StatCard,
    StatGrid,
    VendorLayout,
} from '@/Components';

export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth?.user;
    const roles = auth?.roles || [];
    const isVendor = roles.includes('vendor');

    const summaryStats = [
        { label: 'Total Vendors', value: 128, icon: 'vendors', color: 'primary' },
        { label: 'Active Vendors', value: 94, icon: 'success', color: 'success' },
        { label: 'Pending Review', value: 23, icon: 'clock', color: 'warning' },
        { label: 'Non-Compliant', value: 11, icon: 'warning', color: 'danger' },
    ];

    const updates = [
        { title: 'Vendor Approved', detail: 'TechCorp Solutions', time: '2 minutes ago' },
        { title: 'Payment Requested', detail: 'Global Services Ltd', time: '15 minutes ago' },
        { title: 'Document Expired', detail: 'InfoSys Partners', time: '1 hour ago' },
    ];

    const quickLinks = isVendor
        ? [
              { href: '/vendor/profile', label: 'Profile' },
              { href: '/vendor/documents', label: 'Documents' },
              { href: '/vendor/compliance', label: 'Compliance' },
              { href: '/vendor/payments', label: 'Payments' },
          ]
        : [
              { href: '/admin/vendors', label: 'Vendors' },
              { href: '/admin/payments', label: 'Payments' },
              { href: '/admin/compliance', label: 'Compliance' },
              { href: '/admin/reports', label: 'Reports' },
          ];

    const header = (
        <PageHeader
            title="Dashboard"
            subtitle={`Welcome back, ${user?.name?.split(' ')[0] || 'User'}!`}
            actions={
                <Link href="/notifications" className="btn-secondary">
                    <AppIcon name="notifications" className="h-4 w-4" />
                    Notifications
                </Link>
            }
        />
    );

    const Layout = isVendor ? VendorLayout : AdminLayout;

    return (
        <Layout title="Dashboard" activeNav="Dashboard" header={header}>
            <div className="space-y-6">
                <StatGrid cols={4}>
                    {summaryStats.map((stat) => (
                        <StatCard key={stat.label} {...stat} />
                    ))}
                </StatGrid>

                <div className="grid lg:grid-cols-2 gap-6">
                    <Card title="Recent Updates">
                        <div className="divide-y divide-(--color-border-secondary)">
                            {updates.map((item) => (
                                <div key={`${item.title}-${item.time}`} className="px-5 py-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="font-medium text-(--color-text-primary)">
                                                {item.title}
                                            </p>
                                            <p className="text-sm text-(--color-text-tertiary)">
                                                {item.detail}
                                            </p>
                                        </div>
                                        <Badge status="info" size="sm">
                                            {item.time}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="Quick Links">
                        <div className="grid grid-cols-2 gap-3 p-4">
                            {quickLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="btn-secondary justify-center"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
