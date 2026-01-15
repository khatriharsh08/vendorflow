import { usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { VendorLayout, PageHeader, Card, Button, Badge } from '@/Components';

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
        { id: 'company', label: 'Company Details', icon: '🏢' },
        { id: 'contact', label: 'Contact Info', icon: '📞' },
        { id: 'bank', label: 'Bank Details', icon: '🏦' },
        { id: 'status', label: 'Account Status', icon: '📊' },
    ];

    const header = (
        <PageHeader 
            title="Profile"
            subtitle="Manage your company information"
            actions={
                <div className="flex items-center gap-3">
                    <Badge status={vendor?.status || 'draft'} size="lg" />
                    {!isEditing && vendor?.status !== 'draft' && (
                        <Button onClick={() => setIsEditing(true)}>
                            ✏️ Edit Profile
                        </Button>
                    )}
                </div>
            }
        />
    );

    const InputField = ({ label, name, type = 'text', required = false, disabled = false }) => (
        <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                {label} {required && <span className="text-[var(--color-danger)]">*</span>}
            </label>
            {isEditing && !disabled ? (
                <input
                    type={type}
                    value={form.data[name]}
                    onChange={e => form.setData(name, e.target.value)}
                    className="input-field w-full"
                    required={required}
                />
            ) : (
                <div className="px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-secondary)] rounded-xl text-[var(--color-text-primary)]">
                    {form.data[name] || <span className="text-[var(--color-text-muted)]">Not provided</span>}
                </div>
            )}
            {form.errors[name] && <p className="text-sm text-[var(--color-danger)] mt-1">{form.errors[name]}</p>}
        </div>
    );

    return (
        <VendorLayout title="Profile" activeNav="Profile" header={header} vendor={vendor}>
            <div className="space-y-6">
                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border-secondary)]">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                activeTab === tab.id
                                    ? 'bg-[var(--color-bg-primary)] text-[var(--color-brand-primary)] shadow-sm'
                                    : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'
                            }`}
                        >
                            <span>{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Company Details Tab */}
                    {activeTab === 'company' && (
                        <Card title="Company Details">
                            <div className="grid md:grid-cols-2 gap-6 p-6">
                                <InputField label="Company Name" name="company_name" required />
                                <InputField label="Registration Number" name="registration_number" />
                                <InputField label="GST Number" name="tax_id" />
                                <InputField label="PAN Number" name="pan_number" required />
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        Business Type
                                    </label>
                                    {isEditing ? (
                                        <select
                                            value={form.data.business_type}
                                            onChange={e => form.setData('business_type', e.target.value)}
                                            className="input-field w-full"
                                        >
                                            <option value="">Select business type</option>
                                            <option value="sole_proprietor">Sole Proprietor</option>
                                            <option value="partnership">Partnership</option>
                                            <option value="private_limited">Private Limited</option>
                                            <option value="public_limited">Public Limited</option>
                                            <option value="llp">LLP</option>
                                        </select>
                                    ) : (
                                        <div className="px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-secondary)] rounded-xl text-[var(--color-text-primary)] capitalize">
                                            {form.data.business_type?.replace('_', ' ') || <span className="text-[var(--color-text-muted)]">Not provided</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Contact Info Tab */}
                    {activeTab === 'contact' && (
                        <Card title="Contact Information">
                            <div className="grid md:grid-cols-2 gap-6 p-6">
                                <InputField label="Contact Person" name="contact_person" required />
                                <InputField label="Phone Number" name="contact_phone" required />
                                <InputField label="Email Address" name="contact_email" type="email" disabled />
                                <div className="md:col-span-2">
                                    <InputField label="Address" name="address" required />
                                </div>
                                <InputField label="City" name="city" required />
                                <InputField label="State" name="state" />
                                <InputField label="Pincode" name="pincode" required />
                            </div>
                        </Card>
                    )}

                    {/* Bank Details Tab */}
                    {activeTab === 'bank' && (
                        <Card title="Bank Details">
                            <div className="grid md:grid-cols-2 gap-6 p-6">
                                <InputField label="Bank Name" name="bank_name" required />
                                <InputField label="Account Number" name="bank_account_number" required />
                                <InputField label="IFSC Code" name="bank_ifsc" required />
                                <InputField label="Branch" name="bank_branch" />
                            </div>
                        </Card>
                    )}

                    {/* Account Status Tab */}
                    {activeTab === 'status' && (
                        <div className="space-y-6">
                            <Card title="Account Status">
                                <div className="p-6 space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-[var(--color-bg-secondary)] rounded-xl">
                                        <div>
                                            <div className="text-sm text-[var(--color-text-tertiary)]">Current Status</div>
                                            <div className="text-lg font-semibold text-[var(--color-text-primary)] capitalize mt-1">
                                                {vendor?.status?.replace('_', ' ') || 'Draft'}
                                            </div>
                                        </div>
                                        <Badge status={vendor?.status || 'draft'} size="lg" />
                                    </div>
                                    
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-[var(--color-bg-secondary)] rounded-xl">
                                            <div className="text-sm text-[var(--color-text-tertiary)]">Compliance Score</div>
                                            <div className={`text-2xl font-bold mt-1 ${
                                                (vendor?.compliance_score || 0) >= 80 ? 'text-[var(--color-success)]' :
                                                (vendor?.compliance_score || 0) >= 50 ? 'text-[var(--color-warning)]' :
                                                'text-[var(--color-danger)]'
                                            }`}>
                                                {vendor?.compliance_score || 0}%
                                            </div>
                                        </div>
                                        <div className="p-4 bg-[var(--color-bg-secondary)] rounded-xl">
                                            <div className="text-sm text-[var(--color-text-tertiary)]">Performance Score</div>
                                            <div className="text-2xl font-bold text-[var(--color-brand-primary)] mt-1">
                                                {vendor?.performance_score || 0}/100
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-[var(--color-bg-secondary)] rounded-xl">
                                        <div className="text-sm text-[var(--color-text-tertiary)]">Member Since</div>
                                        <div className="text-lg font-semibold text-[var(--color-text-primary)] mt-1">
                                            {vendor?.created_at ? new Date(vendor.created_at).toLocaleDateString('en-IN', { 
                                                year: 'numeric', month: 'long', day: 'numeric' 
                                            }) : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" onClick={() => { setIsEditing(false); form.reset(); }}>
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
