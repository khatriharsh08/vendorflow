import { router, usePage } from '@inertiajs/react';
import {
    AdminLayout,
    VendorLayout,
    PageHeader,
    Card,
    Button,
    EmptyState,
    AppIcon,
} from '@/Components';

export default function NotificationsIndex({ notifications, unreadCount }) {
    const { auth } = usePage().props;
    const isVendor = auth?.roles?.includes('vendor');

    const markAsRead = (id) => {
        router.post(`/notifications/${id}/read`);
    };

    const markAllAsRead = () => {
        router.post('/notifications/mark-all-read');
    };

    const severityColors = {
        info: 'border-l-status-info bg-(--color-info-light)/35',
        medium: 'border-l-status-warning bg-(--color-warning-light)/35',
        high: 'border-l-status-warning bg-(--color-warning-light)/55',
        critical: 'border-l-status-danger bg-(--color-danger-light)/40',
    };

    const severityIcons = {
        info: 'info',
        medium: 'running',
        high: 'warning',
        critical: 'error',
    };

    const displayNotifications = notifications?.data || notifications || [];

    const header = (
        <PageHeader
            title="Notifications"
            subtitle={`${unreadCount || displayNotifications.filter((n) => !n.read_at).length} unread`}
            actions={
                <Button variant="ghost" onClick={markAllAsRead}>
                    Mark all as read
                </Button>
            }
        />
    );

    const Layout = isVendor ? VendorLayout : AdminLayout;
    const layoutProps = {
        title: 'Notifications',
        activeNav: 'Dashboard',
        header,
    };

    return (
        <Layout {...layoutProps}>
            {displayNotifications.length === 0 ? (
                <EmptyState
                    icon="notifications"
                    title="No notifications"
                    description="You are all caught up. New notifications will appear here."
                />
            ) : (
                <Card>
                    <div className="divide-y divide-(--color-border-secondary)">
                        {displayNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-5 border-l-4 transition-colors ${
                                    severityColors[notification.data?.severity] ||
                                    'border-l-(--color-border-hover)'
                                } ${!notification.read_at ? 'bg-(--color-bg-tertiary)/20' : 'hover:bg-(--color-bg-hover)/10'}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <span className="text-2xl mt-0.5 inline-flex">
                                            <AppIcon
                                                name={
                                                    severityIcons[notification.data?.severity] ||
                                                    'info'
                                                }
                                                className="h-6 w-6"
                                            />
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {!notification.read_at && (
                                                    <span className="w-2 h-2 rounded-full bg-(--color-brand-primary) flex-shrink-0" />
                                                )}
                                                <h3 className="font-semibold text-(--color-text-primary)">
                                                    {notification.data?.title}
                                                </h3>
                                            </div>
                                            <p className="text-(--color-text-tertiary) text-sm mb-2">
                                                {notification.data?.message}
                                            </p>
                                            <div className="text-xs text-(--color-text-tertiary)">
                                                {new Date(
                                                    notification.created_at
                                                ).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    {!notification.read_at && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            Mark read
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </Layout>
    );
}
