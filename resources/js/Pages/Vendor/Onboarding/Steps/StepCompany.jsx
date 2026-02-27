import { useForm } from '@inertiajs/react';
import { FormSelect } from '@/Components/index.jsx';

export default function StepCompany({ vendor, sessionData }) {
    const step1Session = sessionData?.step1 || {};
    const { data, setData, post, processing, errors } = useForm({
        company_name: step1Session.company_name || vendor?.company_name || '',
        registration_number: step1Session.registration_number || vendor?.registration_number || '',
        tax_id: step1Session.tax_id || vendor?.tax_id || '',
        pan_number: step1Session.pan_number || vendor?.pan_number || '',
        business_type: step1Session.business_type || vendor?.business_type || '',
        contact_person: step1Session.contact_person || vendor?.contact_person || '',
        contact_phone: step1Session.contact_phone || vendor?.contact_phone || '',
        address: step1Session.address || vendor?.address || '',
        city: step1Session.city || vendor?.city || '',
        state: step1Session.state || vendor?.state || '',
        pincode: step1Session.pincode || vendor?.pincode || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/vendor/onboarding/step1');
    };

    return (
        <div className="bg-(--color-bg-primary) border border-(--color-border-primary) rounded-2xl p-8 md:p-12 shadow-(--shadow-lg) animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-(--color-text-primary)">
                    Company Information
                </h1>
                <p className="text-(--color-text-tertiary)">Tell us about your business entity.</p>
            </div>

            <form onSubmit={submit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            Company Name <span className="text-(--color-danger)">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.company_name}
                            onChange={(e) => setData('company_name', e.target.value)}
                            className="w-full px-4 py-3 bg-(--color-bg-primary) border border-(--color-border-primary) rounded-lg text-sm focus:border-(--color-border-focus) focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            placeholder="Legal Entity Name"
                        />
                        {errors.company_name && (
                            <p className="text-sm text-(--color-danger)">{errors.company_name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            Business Type
                        </label>
                        <FormSelect
                            value={data.business_type}
                            onChange={(value) => setData('business_type', value)}
                            placeholder="Select Type"
                            options={[
                                { value: 'sole_proprietor', label: 'Sole Proprietorship' },
                                { value: 'partnership', label: 'Partnership' },
                                { value: 'llp', label: 'LLP' },
                                { value: 'pvt_ltd', label: 'Private Limited' },
                                { value: 'public_ltd', label: 'Public Limited' },
                            ]}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            Registration Number
                        </label>
                        <input
                            type="text"
                            value={data.registration_number}
                            onChange={(e) => setData('registration_number', e.target.value)}
                            className="w-full px-4 py-3 bg-(--color-bg-primary) border border-(--color-border-primary) rounded-lg text-sm focus:border-(--color-border-focus) focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            placeholder="CIN / LLPIN"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            GST Number
                        </label>
                        <input
                            type="text"
                            value={data.tax_id}
                            onChange={(e) => setData('tax_id', e.target.value.toUpperCase())}
                            className="w-full px-4 py-3 bg-(--color-bg-primary) border border-(--color-border-primary) rounded-lg text-sm focus:border-(--color-border-focus) focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            placeholder="22AAAAA0000A1Z5"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            PAN Number <span className="text-(--color-danger)">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.pan_number}
                            onChange={(e) => setData('pan_number', e.target.value.toUpperCase())}
                            className="w-full px-4 py-3 bg-(--color-bg-primary) border border-(--color-border-primary) rounded-lg text-sm focus:border-(--color-border-focus) focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            placeholder="ABCDE1234F"
                        />
                        {errors.pan_number && (
                            <p className="text-sm text-(--color-danger)">{errors.pan_number}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            Contact Person <span className="text-(--color-danger)">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.contact_person}
                            onChange={(e) => setData('contact_person', e.target.value)}
                            className="w-full px-4 py-3 bg-(--color-bg-primary) border border-(--color-border-primary) rounded-lg text-sm focus:border-(--color-border-focus) focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            Phone Number <span className="text-(--color-danger)">*</span>
                        </label>
                        <input
                            type="tel"
                            value={data.contact_phone}
                            onChange={(e) => setData('contact_phone', e.target.value)}
                            className="w-full px-4 py-3 bg-(--color-bg-primary) border border-(--color-border-primary) rounded-lg text-sm focus:border-(--color-border-focus) focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            placeholder="+91 98765 43210"
                        />
                        {errors.contact_phone && (
                            <p className="text-sm text-(--color-danger)">{errors.contact_phone}</p>
                        )}
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            Registered Address <span className="text-(--color-danger)">*</span>
                        </label>
                        <textarea
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            className="w-full px-4 py-3 bg-(--color-bg-primary) border border-(--color-border-primary) rounded-lg text-sm focus:border-(--color-border-focus) focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all min-h-[80px]"
                            placeholder="Full street address"
                        ></textarea>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            City <span className="text-(--color-danger)">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.city}
                            onChange={(e) => setData('city', e.target.value)}
                            className="w-full px-4 py-3 bg-(--color-bg-primary) border border-(--color-border-primary) rounded-lg text-sm focus:border-(--color-border-focus) focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            State
                        </label>
                        <input
                            type="text"
                            value={data.state}
                            onChange={(e) => setData('state', e.target.value)}
                            className="w-full px-4 py-3 bg-(--color-bg-primary) border border-(--color-border-primary) rounded-lg text-sm focus:border-(--color-border-focus) focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            Pincode <span className="text-(--color-danger)">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.pincode}
                            onChange={(e) => setData('pincode', e.target.value)}
                            className="w-full px-4 py-3 bg-(--color-bg-primary) border border-(--color-border-primary) rounded-lg text-sm focus:border-(--color-border-focus) focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-linear-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/25 hover:-translate-y-px hover:shadow-indigo-500/40 transition-all flex items-center gap-2 text-lg px-8 py-3"
                    >
                        {processing ? 'Saving...' : 'Save & Continue'}
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
}
