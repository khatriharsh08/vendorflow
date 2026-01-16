import { Link, usePage, router } from '@inertiajs/react';
import { AdminLayout, DataTable, Badge, PageHeader, Button } from '@/Components';
import { useState } from 'react';

export default function Index() {
    const { messages, stats, filters } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/contact-messages', { search, status: filters?.status }, { preserveState: true });
    };

    const columns = [
        { 
            header: 'Message', 
            render: (row) => (
                <div className="min-w-0">
                    <div className="text-[var(--color-text-primary)] font-medium truncate">{row.subject}</div>
                    <div className="text-sm text-[var(--color-text-tertiary)] truncate max-w-xs">{row.message?.substring(0, 60)}...</div>
                </div>
            )
        },
        { 
            header: 'Sender', 
            render: (row) => (
                <div>
                    <div className="text-[var(--color-text-primary)] font-medium">{row.name}</div>
                    <div className="text-sm text-[var(--color-text-tertiary)]">{row.email}</div>
                </div>
            )
        },
        { 
            header: 'Status', 
            align: 'center',
            render: (row) => <Badge status={row.status} />
        },
        { 
            header: 'Received', 
            render: (row) => (
                <span className="text-[var(--color-text-secondary)]">
                    {new Date(row.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
            )
        },
        { 
            header: 'Actions', 
            align: 'right',
            render: (row) => (
                <Link href={`/admin/contact-messages/${row.id}`}>
                    <Button variant="ghost" size="sm">View →</Button>
                </Link>
            )
        },
    ];

    const statusFilters = ['all', 'new', 'read', 'replied', 'closed'];

    const header = (
        <PageHeader 
            title="Contact Messages" 
            subtitle="Manage and respond to customer inquiries"
            actions={
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search messages..."
                        className="input-field"
                    />
                    <Button type="submit">Search</Button>
                </form>
            }
        />
    );

    return (
        <AdminLayout title="Contact Messages" activeNav="Messages" header={header}>
            <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="card p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[var(--color-text-tertiary)] mb-1">Total</p>
                                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats?.total || 0}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-tertiary)] flex items-center justify-center">
                                <svg className="w-5 h-5 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="card p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[var(--color-info)] mb-1">New</p>
                                <p className="text-2xl font-bold text-[var(--color-info)]">{stats?.new || 0}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-[var(--color-info)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="card p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[var(--color-success)] mb-1">Replied</p>
                                <p className="text-2xl font-bold text-[var(--color-success)]">{stats?.replied || 0}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="card p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[var(--color-text-tertiary)] mb-1">Read</p>
                                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats?.read || 0}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-tertiary)] flex items-center justify-center">
                                <svg className="w-5 h-5 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Filters */}
                <div className="inline-flex gap-2 p-1 bg-[var(--color-bg-tertiary)] rounded-xl flex-wrap">
                    {statusFilters.map((status) => (
                        <Link
                            key={status}
                            href={`/admin/contact-messages?status=${status === 'all' ? '' : status}${search ? `&search=${search}` : ''}`}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                                (filters?.status === status || (!filters?.status && status === 'all'))
                                    ? 'bg-[var(--color-brand-primary)] text-white shadow-[var(--shadow-primary)]' 
                                    : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-primary)]'
                            }`}
                        >
                            {status}
                        </Link>
                    ))}
                </div>

                {/* Messages Table */}
                <DataTable 
                    columns={columns} 
                    data={messages?.data || []}
                    emptyMessage="No messages found"
                    onRowClick={(row) => router.visit(`/admin/contact-messages/${row.id}`)}
                />
            </div>
        </AdminLayout>
    );
}
