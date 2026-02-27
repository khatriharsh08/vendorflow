import { usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    VendorLayout,
    PageHeader,
    Card,
    Button,
    Badge,
    AppIcon,
    FormInput,
    FormSelect,
} from '@/Components';

export default function Profile({ vendor }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('company');

    const form = useForm({
        company_name: vendor?.company_name || '',
        registration_number: vendor?.registration_number || '',
        tax_id: vendor?.tax_id || '',
        pan_number: vendor?.pan_number || '',
        business_type: vendor?.business_type || '',
        contact_person: vendor?.contact_person || '',
        contact_phone: vendor?.contact_phone || '',
        contact_email: vendor?.contact_email || user?.email || '',
        address: vendor?.address || '',
        city: vendor?.city || '',
        state: vendor?.state || '',
        pincode: vendor?.pincode || '',
        bank_name: vendor?.bank_name || '',
        bank_account_number: vendor?.bank_account_number || '',
        bank_ifsc: vendor?.bank_ifsc || '',
        bank_branch: vendor?.bank_branch || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.put('/vendor/profile', {
            onSuccess: () => setIsEditing(false),
        });
    };

    const tabs = [
        { id: 'company', label: 'Company Details', icon: 'vendors' },
        { id: 'contact', label: 'Contact Info', icon: 'messages' },
        { id: 'bank', label: 'Bank Details', icon: 'payments' },
        { id: 'status', label: 'Account Status', icon: 'metrics' },
    ];

    const header = (
        <PageHeader
            title="Profile"
            subtitle="Manage your company information"
            actions={
                <div className="flex items-center gap-3">
                    <Badge status={vendor?.status || 'draft'} size="lg" />
                    {!isEditing && vendor?.status !== 'draft' && (
                        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    )}
                </div>
            }
        />
    );

    return (
        <VendorLayout title="Profile" activeNav="Profile" header={header} vendor={vendor}>
            <div className="space-y-6">
                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-(--color-bg-secondary) rounded-xl border border-(--color-border-secondary)">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                activeTab === tab.id
                                    ? 'bg-(--color-bg-primary) text-(--color-brand-primary) shadow-sm'
                                    : 'text-(--color-text-tertiary) hover:text-(--color-text-primary)'
                            }`}
                        >
                            <span className="inline-flex">
                                <AppIcon name={tab.icon} className="h-4 w-4" />
                            </span>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Company Details Tab */}
                    {activeTab === 'company' && (
                        <Card title="Company Details">
                            <div className="grid md:grid-cols-2 gap-6 p-6">
                                <FormInput
                                    label="Company Name"
                                    value={form.data.company_name}
                                    onChange={(val) => form.setData('company_name', val)}
                                    error={form.errors.company_name}
                                    required
                                    disabled={!isEditing}
                                />
                                <FormInput
                                    label="Registration Number"
                                    value={form.data.registration_number}
                                    onChange={(val) => form.setData('registration_number', val)}
                                    error={form.errors.registration_number}
                                    disabled={!isEditing}
                                />
                                <FormInput
                                    label="GST Number"
                                    value={form.data.tax_id}
                                    onChange={(val) => form.setData('tax_id', val)}
                                    error={form.errors.tax_id}
                                    disabled={!isEditing}
                                />
                                <FormInput
                                    label="PAN Number"
                                    value={form.data.pan_number}
                                    onChange={(val) => form.setData('pan_number', val)}
                                    error={form.errors.pan_number}
                                    required
                                    disabled={!isEditing}
                                />
                                <div className="md:col-span-2">
                                    <FormSelect
                                        label="Business Type"
                                        value={form.data.business_type}
                                        onChange={(val) => form.setData('business_type', val)}
                                        error={form.errors.business_type}
                                        options={[
                                            { value: 'sole_proprietor', label: 'Sole Proprietor' },
                                            { value: 'partnership', label: 'Partnership' },
                                            { value: 'private_limited', label: 'Private Limited' },
                                            { value: 'public_limited', label: 'Public Limited' },
                                            { value: 'llp', label: 'LLP' },
                                        ]}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Contact Info Tab */}
                    {activeTab === 'contact' && (
                        <Card title="Contact Information">
                            <div className="grid md:grid-cols-2 gap-6 p-6">
                                <FormInput
                                    label="Contact Person"
                                    value={form.data.contact_person}
                                    onChange={(val) => form.setData('contact_person', val)}
                                    error={form.errors.contact_person}
                                    required
                                    disabled={!isEditing}
                                />
                                <FormInput
                                    label="Phone Number"
                                    value={form.data.contact_phone}
                                    onChange={(val) => form.setData('contact_phone', val)}
                                    error={form.errors.contact_phone}
                                    required
                                    disabled={!isEditing}
                                />
                                <FormInput
                                    label="Email Address"
                                    type="email"
                                    value={form.data.contact_email}
                                    onChange={(val) => form.setData('contact_email', val)}
                                    error={form.errors.contact_email}
                                    disabled={true} // Always disabled
                                />
                                <div className="md:col-span-2">
                                    <FormInput
                                        label="Address"
                                        value={form.data.address}
                                        onChange={(val) => form.setData('address', val)}
                                        error={form.errors.address}
                                        required
                                        disabled={!isEditing}
                                    />
                                </div>
                                <FormInput
                                    label="City"
                                    value={form.data.city}
                                    onChange={(val) => form.setData('city', val)}
                                    error={form.errors.city}
                                    required
                                    disabled={!isEditing}
                                />
                                <FormInput
                                    label="State"
                                    value={form.data.state}
                                    onChange={(val) => form.setData('state', val)}
                                    error={form.errors.state}
                                    disabled={!isEditing}
                                />
                                <FormInput
                                    label="Pincode"
                                    value={form.data.pincode}
                                    onChange={(val) => form.setData('pincode', val)}
                                    error={form.errors.pincode}
                                    required
                                    disabled={!isEditing}
                                />
                            </div>
                        </Card>
                    )}

                    {/* Bank Details Tab */}
                    {activeTab === 'bank' && (
                        <Card title="Bank Details">
                            <div className="grid md:grid-cols-2 gap-6 p-6">
                                <FormInput
                                    label="Bank Name"
                                    value={form.data.bank_name}
                                    onChange={(val) => form.setData('bank_name', val)}
                                    error={form.errors.bank_name}
                                    required
                                    disabled={!isEditing}
                                />
                                <FormInput
                                    label="Account Number"
                                    value={form.data.bank_account_number}
                                    onChange={(val) => form.setData('bank_account_number', val)}
                                    error={form.errors.bank_account_number}
                                    required
                                    disabled={!isEditing}
                                />
                                <FormInput
                                    label="IFSC Code"
                                    value={form.data.bank_ifsc}
                                    onChange={(val) => form.setData('bank_ifsc', val)}
                                    error={form.errors.bank_ifsc}
                                    required
                                    disabled={!isEditing}
                                />
                                <FormInput
                                    label="Branch"
                                    value={form.data.bank_branch}
                                    onChange={(val) => form.setData('bank_branch', val)}
                                    error={form.errors.bank_branch}
                                    disabled={!isEditing}
                                />
                            </div>
                        </Card>
                    )}

                    {/* Account Status Tab */}
                    {activeTab === 'status' && (
                        <div className="space-y-6">
                            <Card title="Account Status">
                                <div className="p-6 space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-(--color-bg-secondary) rounded-xl">
                                        <div>
                                            <div className="text-sm text-(--color-text-tertiary)">
                                                Current Status
                                            </div>
                                            <div className="text-lg font-semibold text-(--color-text-primary) capitalize mt-1">
                                                {vendor?.status?.replace('_', ' ') || 'Draft'}
                                            </div>
                                        </div>
                                        <Badge status={vendor?.status || 'draft'} size="lg" />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-(--color-bg-secondary) rounded-xl">
                                            <div className="text-sm text-(--color-text-tertiary)">
                                                Compliance Score
                                            </div>
                                            <div
                                                className={`text-2xl font-bold mt-1 ${
                                                    (vendor?.compliance_score || 0) >= 80
                                                        ? 'text-(--color-success)'
                                                        : (vendor?.compliance_score || 0) >= 50
                                                          ? 'text-(--color-warning)'
                                                          : 'text-(--color-danger)'
                                                }`}
                                            >
                                                {vendor?.compliance_score || 0}%
                                            </div>
                                        </div>
                                        <div className="p-4 bg-(--color-bg-secondary) rounded-xl">
                                            <div className="text-sm text-(--color-text-tertiary)">
                                                Performance Score
                                            </div>
                                            <div className="text-2xl font-bold text-(--color-brand-primary) mt-1">
                                                {vendor?.performance_score || 0}/100
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-(--color-bg-secondary) rounded-xl">
                                        <div className="text-sm text-(--color-text-tertiary)">
                                            Member Since
                                        </div>
                                        <div className="text-lg font-semibold text-(--color-text-primary) mt-1">
                                            {vendor?.created_at
                                                ? new Date(vendor.created_at).toLocaleDateString(
                                                      'en-IN',
                                                      {
                                                          year: 'numeric',
                                                          month: 'long',
                                                          day: 'numeric',
                                                      }
                                                  )
                                                : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex justify-end gap-3 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsEditing(false);
                                    form.reset();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </VendorLayout>
    );
}
