import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    VendorLayout,
    AdminLayout,
    PageHeader,
    Card,
    Button,
    FormInput,
    Modal,
    ModalCancelButton,
    ModalPrimaryButton,
    Alert,
    AppIcon,
} from '@/Components';

export default function ProfileEdit() {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isVendor = auth?.roles?.includes('vendor');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeSection, setActiveSection] = useState('profile');

    const profileForm = useForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const deleteForm = useForm({
        password: '',
    });

    const updateProfile = (e) => {
        e.preventDefault();
        profileForm.patch('/profile');
    };

    const updatePassword = (e) => {
        e.preventDefault();
        passwordForm.post('/profile/password', {
            onSuccess: () => passwordForm.reset(),
        });
    };

    const deleteAccount = () => {
        deleteForm.delete('/profile', {
            onSuccess: () => (window.location.href = '/'),
        });
    };

    const Layout = isVendor ? VendorLayout : AdminLayout;
    const layoutProps = isVendor
        ? { title: 'Profile Settings', activeNav: 'Profile' }
        : { title: 'Profile Settings', activeNav: 'Dashboard' };

    const header = <PageHeader title="Profile Settings" subtitle="Manage your account settings" />;

    const sections = [
        { id: 'profile', label: 'Profile', icon: 'profile' },
        { id: 'password', label: 'Password', icon: 'settings' },
        { id: 'danger', label: 'Danger Zone', icon: 'warning' },
    ];

    return (
        <Layout {...layoutProps} header={header}>
            <div className="max-w-4xl">
                {/* Section Tabs */}
                <div className="flex gap-2 mb-8">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeSection === section.id
                                    ? 'bg-(--color-brand-primary) text-white shadow-md'
                                    : 'bg-white text-(--color-text-secondary) hover:text-(--color-brand-primary) border border-(--color-border-primary) shadow-sm'
                            }`}
                        >
                            <span className="inline-flex">
                                <AppIcon name={section.icon} className="h-4 w-4" />
                            </span>
                            {section.label}
                        </button>
                    ))}
                </div>

                {/* Profile Section */}
                {activeSection === 'profile' && (
                    <Card title="Profile Information">
                        <form onSubmit={updateProfile} className="p-6 space-y-6">
                            <FormInput
                                label="Full Name"
                                value={profileForm.data.name}
                                onChange={(val) => profileForm.setData('name', val)}
                                error={profileForm.errors.name}
                                required
                            />
                            <FormInput
                                label="Email Address"
                                type="email"
                                value={profileForm.data.email}
                                onChange={(val) => profileForm.setData('email', val)}
                                error={profileForm.errors.email}
                                required
                            />
                            <FormInput
                                label="Phone Number"
                                value={profileForm.data.phone}
                                onChange={(val) => profileForm.setData('phone', val)}
                                error={profileForm.errors.phone}
                            />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={profileForm.processing}>
                                    {profileForm.processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}

                {/* Password Section */}
                {activeSection === 'password' && (
                    <Card title="Update Password">
                        <form onSubmit={updatePassword} className="p-6 space-y-6">
                            <FormInput
                                label="Current Password"
                                type="password"
                                value={passwordForm.data.current_password}
                                onChange={(val) => passwordForm.setData('current_password', val)}
                                error={passwordForm.errors.current_password}
                                required
                            />
                            <FormInput
                                label="New Password"
                                type="password"
                                value={passwordForm.data.password}
                                onChange={(val) => passwordForm.setData('password', val)}
                                error={passwordForm.errors.password}
                                required
                            />
                            <FormInput
                                label="Confirm New Password"
                                type="password"
                                value={passwordForm.data.password_confirmation}
                                onChange={(val) =>
                                    passwordForm.setData('password_confirmation', val)
                                }
                                required
                            />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={passwordForm.processing}>
                                    {passwordForm.processing ? 'Updating...' : 'Update Password'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}

                {/* Danger Zone */}
                {activeSection === 'danger' && (
                    <Card title="Danger Zone">
                        <div className="p-6">
                            <Alert type="warning" title="Delete Account">
                                Once you delete your account, all of your data will be permanently
                                removed. This action cannot be undone.
                            </Alert>
                            <div className="mt-6">
                                <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                                    Delete My Account
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Account"
                footer={
                    <>
                        <ModalCancelButton onClick={() => setShowDeleteModal(false)} />
                        <ModalPrimaryButton
                            variant="danger"
                            onClick={deleteAccount}
                            disabled={!deleteForm.data.password || deleteForm.processing}
                        >
                            {deleteForm.processing ? 'Deleting...' : 'Delete Account'}
                        </ModalPrimaryButton>
                    </>
                }
            >
                <div className="space-y-4">
                    <Alert type="error">
                        This action is irreversible. All your data will be permanently deleted.
                    </Alert>
                    <FormInput
                        label="Enter your password to confirm"
                        type="password"
                        value={deleteForm.data.password}
                        onChange={(val) => deleteForm.setData('password', val)}
                        error={deleteForm.errors.password}
                        required
                    />
                </div>
            </Modal>
        </Layout>
    );
}
