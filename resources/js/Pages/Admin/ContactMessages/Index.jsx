import { Link, usePage, router } from '@inertiajs/react';
import { AdminLayout, DataTable, Card, Badge, PageHeader } from '@/Components';
import { useState } from 'react';

export default function Index() {
    const { messages, stats, filters } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');

    const statusColors = {
        new: 'blue',
        read: 'gray',
        replied: 'green',
        closed: 'red',
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.contact-messages.index'), { search, status: filters.status }, { preserveState: true });
    };

    const columns = [
        { header: 'Subject', accessor: 'subject', render: (val, row) => (
            <div>
                <div className="font-medium text-gray-900">{val}</div>
                <div className="text-xs text-gray-500 truncate max-w-xs">{row.message.substring(0, 50)}...</div>
            </div>
        )},
        { header: 'Sender', accessor: 'name', render: (val, row) => (
            <div>
                <div className="text-sm text-gray-900">{val}</div>
                <div className="text-xs text-gray-500">{row.email}</div>
            </div>
        )},
        { header: 'Status', accessor: 'status', render: (val) => (
            <Badge variant={statusColors[val]}>{val.toUpperCase()}</Badge>
        )},
        { header: 'Date', accessor: 'created_at', render: (val) => new Date(val).toLocaleDateString() },
        { header: 'Actions', accessor: 'id', render: (val) => (
            <div className="flex gap-2">
                <Link 
                    href={route('admin.contact-messages.show', val)} 
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                    View
                </Link>
            </div>
        )},
    ];

    return (
        <AdminLayout title="Messages">
            <PageHeader 
                title="Contact Messages" 
                subtitle="Manage inquiries from the contact form."
            />

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card>
                    <div className="text-sm text-gray-500">Total Messages</div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                </Card>
                <Card>
                    <div className="text-sm text-blue-500">New</div>
                    <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
                </Card>
                <Card>
                    <div className="text-sm text-green-500">Replied</div>
                    <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
                </Card>
                <Card>
                    <div className="text-sm text-gray-500">Read</div>
                    <div className="text-2xl font-bold">{stats.read}</div>
                </Card>
            </div>

            <Card>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-2">
                        {['all', 'new', 'read', 'replied', 'closed'].map(status => (
                            <Link
                                key={status}
                                href={route('admin.contact-messages.index', { status: status === 'all' ? '' : status })}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    (filters.status === status || (!filters.status && status === 'all'))
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Link>
                        ))}
                    </div>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search messages..."
                            className="rounded-lg border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                            Search
                        </button>
                    </form>
                </div>

                <DataTable
                    columns={columns}
                    data={messages.data}
                    pagination={messages.links}
                />
            </Card>
        </AdminLayout>
    );
}
