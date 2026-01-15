import { usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { VendorLayout, PageHeader, Card, Button } from '@/Components';

export default function Notifications({ vendor, notifications = { data: [] } }) {
    const { auth } = usePage().props;
    const [filter, setFilter] = useState('all');

    const displayNotifications = notifications.data || [];
    
    const unreadCount = displayNotifications.filter(n => !n.read_at).length;
    
    const filteredNotifications = filter === 'all' 
        ? displayNotifications 
        : filter === 'unread'
        ? displayNotifications.filter(n => !n.read_at)
        : displayNotifications.filter(n => n.type === filter);

    const notificationTypes = {
        document: { icon: '📄', label: 'Document', color: 'bg-blue-100 text-blue-600' },
        payment: { icon: '💰', label: 'Payment', color: 'bg-green-100 text-green-600' },
        compliance: { icon: '🛡️', label: 'Compliance', color: 'bg-amber-100 text-amber-600' },
        performance: { icon: '📈', label: 'Performance', color: 'bg-purple-100 text-purple-600' },
        system: { icon: '⚙️', label: 'System', color: 'bg-gray-100 text-gray-600' },
        status: { icon: '📊', label: 'Status', color: 'bg-indigo-100 text-indigo-600' },
    };

    const handleMarkAsRead = (id) => {
        router.patch(`/vendor/notifications/${id}/read`, {}, {
            preserveScroll: true,
        });
    };

    const handleMarkAllAsRead = () => {
        router.patch('/vendor/notifications/read-all', {}, {
            preserveScroll: true,
        });
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
                        ✓ Mark All as Read
                    </Button>
                )
            }
        />
    );

    const filters = [
        { id: 'all', label: 'All', count: displayNotifications.length },
        { id: 'unread', label: 'Unread', count: unreadCount },
        { id: 'document', label: '📄 Documents' },
        { id: 'payment', label: '💰 Payments' },
        { id: 'compliance', label: '🛡️ Compliance' },
    ];

    return (
        <VendorLayout title="Notifications" activeNav="Notifications" header={header} vendor={vendor}>
            <div className="space-y-6">
                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {filters.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                                filter === f.id
                                    ? 'bg-[var(--color-brand-primary)] text-white'
                                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                            }`}
                        >
                            {f.label}
                            {f.count !== undefined && (
                                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                                    filter === f.id 
                                        ? 'bg-white/20' 
                                        : 'bg-[var(--color-bg-tertiary)]'
                                }`}>
                                    {f.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
                <Card>
                    {filteredNotifications.length === 0 ? (
                        <div className="p-12 text-center text-[var(--color-text-tertiary)]">
                            <div className="text-5xl mb-4">🔔</div>
                            <p className="text-lg font-medium">No notifications</p>
                            <p className="text-sm mt-1">
                                {filter === 'all' 
                                    ? "You're all caught up!" 
                                    : `No ${filter} notifications found.`}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--color-border-secondary)]">
                            {filteredNotifications.map((notification) => {
                                const typeInfo = notificationTypes[notification.type] || notificationTypes.system;
                                const isUnread = !notification.read_at;
                                
                                return (
                                    <div 
                                        key={notification.id} 
                                        className={`p-4 hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer ${
                                            isUnread ? 'bg-indigo-50/50' : ''
                                        }`}
                                        onClick={() => isUnread && handleMarkAsRead(notification.id)}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${typeInfo.color}`}>
                                                {typeInfo.icon}
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className={`font-medium ${
                                                        isUnread 
                                                            ? 'text-[var(--color-text-primary)]' 
                                                            : 'text-[var(--color-text-secondary)]'
                                                    }`}>
                                                        {notification.title}
                                                    </h3>
                                                    <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                                                        {formatDate(notification.created_at)}
                                                    </span>
                                                </div>
                                                <p className={`text-sm mt-1 ${
                                                    isUnread 
                                                        ? 'text-[var(--color-text-secondary)]' 
                                                        : 'text-[var(--color-text-tertiary)]'
                                                }`}>
                                                    {notification.message}
                                                </p>
                                                
                                                {/* Action buttons based on notification data */}
                                                {notification.data?.action_url && (
                                                    <a 
                                                        href={notification.data.action_url}
                                                        className="inline-flex items-center gap-1 text-sm text-[var(--color-brand-primary)] hover:underline mt-2"
                                                    >
                                                        {notification.data.action_text || 'View Details'} →
                                                    </a>
                                                )}
                                            </div>
                                            
                                            {/* Unread indicator */}
                                            {isUnread && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-brand-primary)] flex-shrink-0 mt-2" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>

                {/* Sample Notifications Info (for empty state) */}
                {displayNotifications.length === 0 && (
                    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-secondary)] rounded-xl p-6">
                        <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">
                            What notifications will you receive?
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                { icon: '📄', title: 'Document Updates', desc: 'When your documents are verified or need attention' },
                                { icon: '💰', title: 'Payment Status', desc: 'Updates on your payment requests and approvals' },
                                { icon: '🛡️', title: 'Compliance Alerts', desc: 'When compliance status changes or action needed' },
                                { icon: '📊', title: 'Account Updates', desc: 'Status changes and important announcements' },
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <span className="text-xl">{item.icon}</span>
                                    <div>
                                        <div className="font-medium text-[var(--color-text-primary)]">{item.title}</div>
                                        <div className="text-sm text-[var(--color-text-tertiary)]">{item.desc}</div>
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
