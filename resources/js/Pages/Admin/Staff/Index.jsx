import { useForm } from '@inertiajs/react';
import {
    AdminLayout,
    Button,
    Card,
    DataTable,
    FormInput,
    FormSelect,
    PageHeader,
} from '@/Components';

const INITIAL_FORM_DATA = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: '',
};

export default function StaffIndex({ staffUsers = [], availableRoles = [] }) {
    const { data, setData, post, processing, errors, clearErrors } = useForm(INITIAL_FORM_DATA);

    const clearForm = () => {
        setData(INITIAL_FORM_DATA);
        clearErrors();
    };

    const submit = (event) => {
        event.preventDefault();

        post('/admin/staff-users', {
            preserveScroll: true,
            onSuccess: clearForm,
        });
    };

    const roleOptions = availableRoles.map((role) => ({
        value: role.value,
        label: role.label,
    }));

    const columns = [
        {
            header: 'Name',
            render: (row) => (
                <span className="font-medium text-(--color-text-primary)">{row.name}</span>
            ),
        },
        {
            header: 'Email',
            render: (row) => <span className="text-(--color-text-secondary)">{row.email}</span>,
        },
        {
            header: 'Roles',
            render: (row) => (
                <span className="text-(--color-text-secondary)">
                    {(row.role_labels || []).join(', ') || '-'}
                </span>
            ),
        },
        {
            header: 'Created',
            render: (row) => <span className="text-(--color-text-tertiary)">{row.created_at}</span>,
        },
    ];

    const header = (
        <PageHeader
            title="Staff Users"
            subtitle="Create and manage internal Ops/Finance/Admin accounts"
        />
    );

    return (
        <AdminLayout title="Staff Users" activeNav="Staff Users" header={header}>
            <div className="space-y-6">
                <Card title="Create Internal User" allowOverflow>
                    <form onSubmit={submit} className="p-4 grid md:grid-cols-2 gap-4">
                        <FormInput
                            label="Full Name"
                            value={data.name}
                            onChange={(value) => setData('name', value)}
                            error={errors.name}
                            required
                        />

                        <FormInput
                            label="Email"
                            type="email"
                            value={data.email}
                            onChange={(value) => setData('email', value)}
                            error={errors.email}
                            required
                        />

                        <FormInput
                            label="Password"
                            type="password"
                            value={data.password}
                            onChange={(value) => setData('password', value)}
                            error={errors.password}
                            required
                        />

                        <FormInput
                            label="Confirm Password"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(value) => setData('password_confirmation', value)}
                            error={errors.password_confirmation}
                            required
                        />

                        <FormSelect
                            label="Role"
                            value={data.role}
                            onChange={(roleValue) => {
                                setData('role', roleValue);
                                clearErrors('role');
                            }}
                            options={roleOptions}
                            placeholder="Select role"
                            error={errors.role}
                            required
                        />

                        <div className="md:col-span-2 flex items-end justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={clearForm}
                                disabled={processing}
                                className="h-11 min-w-[140px] justify-center rounded-xl"
                            >
                                Clear Form
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-11 min-w-[140px] justify-center rounded-xl"
                            >
                                {processing ? 'Creating...' : 'Create User'}
                            </Button>
                        </div>
                    </form>
                </Card>

                <Card title="Internal Users">
                    <DataTable
                        columns={columns}
                        data={staffUsers}
                        emptyMessage="No staff users found"
                    />
                </Card>
            </div>
        </AdminLayout>
    );
}
