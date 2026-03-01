import { router } from '@inertiajs/react';
import { useState } from 'react';
import { VendorLayout, PageHeader, Card, Button, AppIcon } from '@/Components';

export default function Notifications({ vendor, notifications = { data: [] } }) {
    const [filter, setFilter] = useState('all');

    const displayNotifications = notifications.data || [];
    const unreadCount = displayNotifications.filter((n) => !n.read_at).length;

    const filteredNotifications =
        filter === 'all'
            ? displayNotifications
            : filter === 'unread'
              ? displayNotifications.filter((n) => !n.read_at)
              : displayNotifications.filter((n) => n.data?.type === filter);

    const notificationTypes = {
        document: {
            icon: 'documents',
            label: 'Document',
            color: 'bg-(--color-info-light) text-(--color-info)',
        },
        payment: {
            icon: 'payments',
            label: 'Payment',
            color: 'bg-(--color-success-light) text-(--color-success)',
        },
        compliance: {
            icon: 'compliance',
            label: 'Compliance',
            color: 'bg-(--color-warning-light) text-(--color-warning)',
        },
        performance: {
            icon: 'trend',
            label: 'Performance',
            color: 'bg-(--color-brand-primary-light) text-(--color-brand-primary)',
        },
        system: {
            icon: 'settings',
            label: 'System',
            color: 'bg-(--color-bg-tertiary) text-(--color-text-tertiary)',
        },
        status: {
            icon: 'metrics',
            label: 'Status',
            color: 'bg-(--color-brand-primary-light) text-(--color-brand-primary)',
        },
    };

    const handleMarkAsRead = (id) => {
        router.patch(
            `/vendor/notifications/${id}/read`,
            {},
            {
                preserveScroll: true,
            }
        );
    };

    const handleMarkAllAsRead = () => {
        router.patch(
            '/vendor/notifications/read-all',
            {},
            {
                preserveScroll: true,
            }
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    };

    const header = (
        <PageHeader
            title="Notifications"
            subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
            actions={
                unreadCount > 0 && (
                    <Button variant="outline" onClick={handleMarkAllAsRead}>
                        Mark All as Read
                    </Button>
                )
            }
        />
    );

    const filters = [
        { id: 'all', label: 'All', count: displayNotifications.length },
        { id: 'unread', label: 'Unread', count: unreadCount },
        { id: 'document', label: 'Documents' },
        { id: 'payment', label: 'Payments' },
        { id: 'compliance', label: 'Compliance' },
    ];

    return (
        <VendorLayout
            title="Notifications"
            activeNav="Notifications"
            header={header}
            vendor={vendor}
        >
            <div className="space-y-6">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {filters.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                                filter === f.id
                                    ? 'bg-(--color-brand-primary) text-white'
                                    : 'bg-(--color-bg-secondary) text-(--color-text-secondary) hover:bg-(--color-bg-hover)'
                            }`}
                        >
                            {f.label}
                            {f.count !== undefined && (
                                <span
                                    className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                                        filter === f.id
                                            ? 'bg-(--color-bg-primary)/20'
                                            : 'bg-(--color-bg-tertiary)'
                                    }`}
                                >
                                    {f.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <Card>
                    {filteredNotifications.length === 0 ? (
                        <div className="p-12 text-center text-(--color-text-tertiary)">
                            <div className="text-5xl mb-4 inline-flex justify-center w-full">
                                <AppIcon name="notifications" className="h-12 w-12" />
                            </div>
                            <p className="text-lg font-medium">No notifications</p>
                            <p className="text-sm mt-1">
                                {filter === 'all'
                                    ? 'You are all caught up.'
                                    : `No ${filter} notifications found.`}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-(--color-border-secondary)">
                            {filteredNotifications.map((notification) => {
                                const typeInfo =
                                    notificationTypes[notification.data?.type] ||
                                    notificationTypes.system;
                                const isUnread = !notification.read_at;

                                return (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-(--color-bg-hover) transition-colors cursor-pointer ${
                                            isUnread ? 'bg-(--color-brand-primary-light)/50' : ''
                                        }`}
                                        onClick={() =>
                                            isUnread && handleMarkAsRead(notification.id)
                                        }
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeInfo.color}`}
                                            >
                                                <AppIcon name={typeInfo.icon} className="h-5 w-5" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3
                                                        className={`font-medium ${
                                                            isUnread
                                                                ? 'text-(--color-text-primary)'
                                                                : 'text-(--color-text-secondary)'
                                                        }`}
                                                    >
                                                        {notification.data?.title}
                                                    </h3>
                                                    <span className="text-xs text-(--color-text-muted) whitespace-nowrap">
                                                        {formatDate(notification.created_at)}
                                                    </span>
                                                </div>
                                                <p
                                                    className={`text-sm mt-1 ${
                                                        isUnread
                                                            ? 'text-(--color-text-secondary)'
                                                            : 'text-(--color-text-tertiary)'
                                                    }`}
                                                >
                                                    {notification.data?.message}
                                                </p>

                                                {notification.data?.action_url && (
                                                    <a
                                                        href={notification.data.action_url}
                                                        className="inline-flex items-center gap-1 text-sm text-(--color-brand-primary) hover:underline mt-2"
                                                    >
                                                        {notification.data.action_text ||
                                                            'View Details'}
                                                    </a>
                                                )}
                                            </div>

                                            {isUnread && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-(--color-brand-primary) flex-shrink-0 mt-2" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>

                {displayNotifications.length === 0 && (
                    <div className="bg-(--color-bg-secondary) border border-(--color-border-secondary) rounded-xl p-6">
                        <h3 className="font-semibold text-(--color-text-primary) mb-4">
                            What notifications will you receive?
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                {
                                    icon: 'documents',
                                    title: 'Document Updates',
                                    desc: 'When your documents are verified or need attention',
                                },
                                {
                                    icon: 'payments',
                                    title: 'Payment Status',
                                    desc: 'Updates on your payment requests and approvals',
                                },
                                {
                                    icon: 'compliance',
                                    title: 'Compliance Alerts',
                                    desc: 'When compliance status changes or action needed',
                                },
                                {
                                    icon: 'metrics',
                                    title: 'Account Updates',
                                    desc: 'Status changes and important announcements',
                                },
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <span className="text-xl inline-flex mt-0.5">
                                        <AppIcon name={item.icon} className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <div className="font-medium text-(--color-text-primary)">
                                            {item.title}
                                        </div>
                                        <div className="text-sm text-(--color-text-tertiary)">
                                            {item.desc}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </VendorLayout>
    );
}
