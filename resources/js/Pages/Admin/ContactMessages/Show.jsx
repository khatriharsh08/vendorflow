import { useForm, Link } from '@inertiajs/react';
import { AdminLayout, Card, Badge, PageHeader } from '@/Components';

export default function Show({ message }) {
    const { data,setData, put, processing } = useForm({
        status: message.status,
        admin_notes: message.admin_notes || '',
    });

    const statusColors = {
        new: 'blue',
        read: 'gray',
        replied: 'green',
        closed: 'red',
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route('admin.contact-messages.update', message.id));
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this message?')) {
            router.delete(route('admin.contact-messages.destroy', message.id));
        }
    };

    return (
        <AdminLayout title={`Message from ${message.name}`}>
            <PageHeader 
                title="Message Details" 
                subtitle={`Received on ${new Date(message.created_at).toLocaleString()}`}
                backUrl={route('admin.contact-messages.index')}
            >
                <button 
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                >
                    Delete Message
                </button>
            </PageHeader>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Message Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 mb-1">{message.subject}</h1>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>From:</span>
                                    <span className="font-medium text-gray-900">{message.name}</span>
                                    <span>&lt;{message.email}&gt;</span>
                                </div>
                            </div>
                            <Badge variant={statusColors[message.status]}>{message.status.toUpperCase()}</Badge>
                        </div>
                        
                        <div className="prose max-w-none p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="whitespace-pre-wrap text-gray-700">{message.message}</p>
                        </div>
                    </Card>

                    <Card title="Admin Actions">
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                                <select
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="new">New</option>
                                    <option value="read">Read</option>
                                    <option value="replied">Replied</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
                                <textarea
                                    value={data.admin_notes}
                                    onChange={e => setData('admin_notes', e.target.value)}
                                    rows={4}
                                    className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Add notes for your team..."
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card title="Sender Details">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-semibold">Name</label>
                                <p className="text-gray-900">{message.name}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-semibold">Email</label>
                                <p className="text-gray-900 break-all">
                                    <a href={`mailto:${message.email}`} className="text-indigo-600 hover:underline">
                                        {message.email}
                                    </a>
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-semibold">Sent On</label>
                                <p className="text-gray-900">{new Date(message.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </Card>

                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <h4 className="font-semibold text-indigo-900 mb-2">Quick Reply</h4>
                        <p className="text-sm text-indigo-700 mb-3">
                            Clicking the email above will open your default email client to reply directly to the user.
                        </p>
                        <a 
                            href={`mailto:${message.email}?subject=Re: ${message.subject}`}
                            className="block w-full py-2 px-4 bg-white text-indigo-600 text-center font-medium rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors"
                        >
                            Compose Email
                        </a>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
