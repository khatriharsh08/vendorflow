import { useForm, router } from '@inertiajs/react';
import { AdminLayout, Badge, PageHeader, Button } from '@/Components';

export default function Show({ message }) {
    const { data, setData, put, processing } = useForm({
        status: message.status,
        admin_notes: message.admin_notes || '',
    });

    const handleUpdate = (e) => {
        e.preventDefault();
        put(`/admin/contact-messages/${message.id}`);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this message?')) {
            router.delete(`/admin/contact-messages/${message.id}`);
        }
    };

    const header = (
        <PageHeader
            title="Message Details"
            subtitle={`From ${message.name} • ${new Date(message.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
            backUrl="/admin/contact-messages"
            actions={
                <Button variant="danger" onClick={handleDelete}>
                    Delete
                </Button>
            }
        />
    );

    return (
        <AdminLayout title={`Message from ${message.name}`} activeNav="Messages" header={header}>
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Message Card */}
                    <div className="card">
                        <div className="p-6 border-b border-(--color-border-primary)">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-xl font-semibold text-(--color-text-primary) mb-2">
                                        {message.subject}
                                    </h2>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-(--color-brand-primary) flex items-center justify-center text-white font-medium text-sm">
                                                {message.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <span className="text-(--color-text-primary) font-medium">
                                                    {message.name}
                                                </span>
                                                <span className="text-(--color-text-tertiary) mx-2">
                                                    •
                                                </span>
                                                <span className="text-(--color-text-tertiary)">
                                                    {message.email}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Badge status={message.status} />
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-(--color-text-secondary) whitespace-pre-wrap leading-relaxed">
                                {message.message}
                            </p>
                        </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="card">
                        <div className="p-6 border-b border-(--color-border-primary)">
                            <h3 className="text-lg font-semibold text-(--color-text-primary)">
                                Update Status
                            </h3>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-(--color-text-secondary) mb-2">
                                    Status
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="input-field w-full"
                                >
                                    <option value="new">New</option>
                                    <option value="read">Read</option>
                                    <option value="replied">Replied</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-(--color-text-secondary) mb-2">
                                    Internal Notes
                                </label>
                                <textarea
                                    value={data.admin_notes}
                                    onChange={(e) => setData('admin_notes', e.target.value)}
                                    rows={4}
                                    className="input-field w-full resize-none"
                                    placeholder="Add notes for your team..."
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Sender Info */}
                    <div className="card p-6">
                        <h3 className="text-sm font-semibold text-(--color-text-tertiary) uppercase tracking-wider mb-4">
                            Sender Details
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-(--color-text-tertiary) uppercase font-medium">
                                    Name
                                </label>
                                <p className="text-(--color-text-primary) mt-1">{message.name}</p>
                            </div>
                            <div>
                                <label className="text-xs text-(--color-text-tertiary) uppercase font-medium">
                                    Email
                                </label>
                                <p className="mt-1">
                                    <a
                                        href={`mailto:${message.email}`}
                                        className="text-(--color-brand-primary) hover:underline break-all"
                                    >
                                        {message.email}
                                    </a>
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-(--color-text-tertiary) uppercase font-medium">
                                    Received
                                </label>
                                <p className="text-(--color-text-primary) mt-1">
                                    {new Date(message.created_at).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Reply */}
                    <div className="card p-6 bg-gradient-to-br from-(--color-brand-primary)/10 to-(--color-brand-secondary)/10 border-(--color-brand-primary)/20">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-(--color-brand-primary) flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-(--color-text-primary)">
                                Quick Reply
                            </h4>
                        </div>
                        <p className="text-sm text-(--color-text-secondary) mb-4">
                            Open your email client to respond directly.
                        </p>
                        <a
                            href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`}
                            className="block w-full py-2.5 px-4 bg-(--color-brand-primary) text-white text-center font-medium rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Compose Reply
                        </a>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
