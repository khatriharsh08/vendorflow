import { useForm } from '@inertiajs/react';
import { FormSelect } from '@/Components/index.jsx';
import { useState, useMemo } from 'react';
import { INDIAN_STATES, getCitiesForState } from '@/data/indianStatesAndCities';

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

    const [clientErrors, setClientErrors] = useState({});

    // CIN: U12345MH2020PTC123456 (21 chars) or LLPIN: AAA-1234
    const CIN_LLPIN_REGEX = /^([UL][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}|[A-Z]{3}-[0-9]{4})$/;
    // GSTIN: 22AAAAA0000A1Z5 (15 chars)
    const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

    const validateRegistrationNumber = (value) => {
        if (!value || value.trim() === '') {
            return 'Registration Number (CIN / LLPIN) is required.';
        }
        if (!CIN_LLPIN_REGEX.test(value)) {
            return 'Enter a valid CIN (e.g. U12345MH2020PTC123456) or LLPIN (e.g. AAA-1234).';
        }
        return '';
    };

    const validateGstNumber = (value) => {
        if (!value || value.trim() === '') {
            return 'GST Number is required.';
        }
        if (value.length !== 15) {
            return 'GST Number must be exactly 15 characters.';
        }
        if (!GST_REGEX.test(value)) {
            return 'Enter a valid GSTIN (e.g. 22AAAAA0000A1Z5).';
        }
        return '';
    };

    const validateContactPerson = (value) => {
        if (!value || value.trim() === '') {
            return 'Contact Person is required.';
        }
        return '';
    };

    const validatePhoneNumber = (value) => {
        if (!value || value.trim() === '') {
            return 'Phone Number is required.';
        }
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length !== 10) {
            return 'Phone Number must be exactly 10 digits.';
        }
        return '';
    };

    const validateState = (value) => {
        if (!value || value.trim() === '') {
            return 'State is required.';
        }
        return '';
    };

    const validateCity = (value) => {
        if (!value || value.trim() === '') {
            return 'City is required.';
        }
        return '';
    };

    const validateBusinessType = (value) => {
        if (!value || value.trim() === '') {
            return 'Business Type is required.';
        }
        return '';
    };

    const cityOptions = useMemo(() => getCitiesForState(data.state), [data.state]);

    const submit = (e) => {
        e.preventDefault();

        const regError = validateRegistrationNumber(data.registration_number);
        const gstError = validateGstNumber(data.tax_id);
        const contactError = validateContactPerson(data.contact_person);
        const phoneError = validatePhoneNumber(data.contact_phone);
        const stateError = validateState(data.state);
        const cityError = validateCity(data.city);
        const bizError = validateBusinessType(data.business_type);

        if (regError || gstError || contactError || phoneError || stateError || cityError || bizError) {
            setClientErrors({
                registration_number: regError,
                tax_id: gstError,
                contact_person: contactError,
                contact_phone: phoneError,
                state: stateError,
                city: cityError,
                business_type: bizError,
            });
            return;
        }

        setClientErrors({});
        post('/vendor/onboarding/step1');
    };

    return (
        <div className="bg-(--color-bg-primary) border border-(--color-border-primary) rounded-2xl p-8 md:p-12 shadow-token-lg animate-fade-in">
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
                            className="w-full px-4 py-3 bg-(--color-bg-primary) border border-(--color-border-primary) rounded-lg text-sm focus:border-(--color-border-focus) focus:ring-2 focus:ring-(--color-brand-primary)/20 outline-none transition-all"
                            placeholder="Legal Entity Name"
                        />
                        {errors.company_name && (
                            <p className="text-sm text-(--color-danger)">{errors.company_name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            Business Type <span className="text-(--color-danger)">*</span>
                        </label>
                        <FormSelect
                            value={data.business_type}
                            onChange={(value) => {
                                setData('business_type', value);
                                if (clientErrors.business_type) {
                                    setClientErrors((prev) => ({
                                        ...prev,
                                        business_type: validateBusinessType(value),
                                    }));
                                }
                            }}
                            placeholder="Select Type"
                            options={[
                                { value: 'sole_proprietor', label: 'Sole Proprietorship' },
                                { value: 'partnership', label: 'Partnership' },
                                { value: 'llp', label: 'LLP' },
                                { value: 'pvt_ltd', label: 'Private Limited' },
                                { value: 'public_ltd', label: 'Public Limited' },
                            ]}
                            error={clientErrors.business_type || errors.business_type}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            Registration Number <span className="text-(--color-danger)">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.registration_number}
                            onChange={(e) => {
                                const val = e.target.value.toUpperCase();
                                setData('registration_number', val);
                                if (clientErrors.registration_number) {
                                    setClientErrors((prev) => ({
                                        ...prev,
                                        registration_number: validateRegistrationNumber(val),
                                    }));
                                }
                            }}
                            onBlur={() => {
                                setClientErrors((prev) => ({
                                    ...prev,
                                    registration_number: validateRegistrationNumber(data.registration_number),
                                }));
                            }}
                            className={`w-full px-4 py-3 bg-(--color-bg-primary) border rounded-lg text-sm focus:ring-2 outline-none transition-all ${
                                clientErrors.registration_number || errors.registration_number
                                    ? 'border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger)/20'
                                    : 'border-(--color-border-primary) focus:border-(--color-border-focus) focus:ring-(--color-brand-primary)/20'
                            }`}
                            placeholder="U12345MH2020PTC123456 / AAA-1234"
                            maxLength={21}
                        />
                        {(clientErrors.registration_number || errors.registration_number) && (
                            <p className="text-sm text-(--color-danger)">
                                {clientErrors.registration_number || errors.registration_number}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            GST Number <span className="text-(--color-danger)">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.tax_id}
                            onChange={(e) => {
                                const val = e.target.value.toUpperCase();
                                setData('tax_id', val);
                                if (clientErrors.tax_id) {
                                    setClientErrors((prev) => ({
                                        ...prev,
                                        tax_id: validateGstNumber(val),
                                    }));
                                }
                            }}
                            onBlur={() => {
                                setClientErrors((prev) => ({
                                    ...prev,
                                    tax_id: validateGstNumber(data.tax_id),
                                }));
                            }}
                            className={`w-full px-4 py-3 bg-(--color-bg-primary) border rounded-lg text-sm focus:ring-2 outline-none transition-all ${
                                clientErrors.tax_id || errors.tax_id
                                    ? 'border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger)/20'
                                    : 'border-(--color-border-primary) focus:border-(--color-border-focus) focus:ring-(--color-brand-primary)/20'
                            }`}
                            placeholder="22AAAAA0000A1Z5"
                            maxLength={15}
                        />
                        {(clientErrors.tax_id || errors.tax_id) && (
                            <p className="text-sm text-(--color-danger)">
                                {clientErrors.tax_id || errors.tax_id}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            PAN Number <span className="text-(--color-danger)">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.pan_number}
                            onChange={(e) => setData('pan_number', e.target.value.toUpperCase())}
                            className="w-full px-4 py-3 bg-(--color-bg-primary) border border-(--color-border-primary) rounded-lg text-sm focus:border-(--color-border-focus) focus:ring-2 focus:ring-(--color-brand-primary)/20 outline-none transition-all"
                            placeholder="ABCDE1234F"
                            maxLength={10}
                            pattern="[A-Z]{5}[0-9]{4}[A-Z]"
                            title="5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)"
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
                            onChange={(e) => {
                                setData('contact_person', e.target.value);
                                if (clientErrors.contact_person) {
                                    setClientErrors((prev) => ({
                                        ...prev,
                                        contact_person: validateContactPerson(e.target.value),
                                    }));
                                }
                            }}
                            onBlur={() => {
                                setClientErrors((prev) => ({
                                    ...prev,
                                    contact_person: validateContactPerson(data.contact_person),
                                }));
                            }}
                            className={`w-full px-4 py-3 bg-(--color-bg-primary) border rounded-lg text-sm focus:ring-2 outline-none transition-all ${
                                clientErrors.contact_person || errors.contact_person
                                    ? 'border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger)/20'
                                    : 'border-(--color-border-primary) focus:border-(--color-border-focus) focus:ring-(--color-brand-primary)/20'
                            }`}
                            placeholder="Full name of contact person"
                        />
                        {(clientErrors.contact_person || errors.contact_person) && (
                            <p className="text-sm text-(--color-danger)">
                                {clientErrors.contact_person || errors.contact_person}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            Phone Number <span className="text-(--color-danger)">*</span>
                        </label>
                        <input
                            type="tel"
                            value={data.contact_phone}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setData('contact_phone', val);
                                if (clientErrors.contact_phone) {
                                    setClientErrors((prev) => ({
                                        ...prev,
                                        contact_phone: validatePhoneNumber(val),
                                    }));
                                }
                            }}
                            onBlur={() => {
                                setClientErrors((prev) => ({
                                    ...prev,
                                    contact_phone: validatePhoneNumber(data.contact_phone),
                                }));
                            }}
                            className={`w-full px-4 py-3 bg-(--color-bg-primary) border rounded-lg text-sm focus:ring-2 outline-none transition-all ${
                                clientErrors.contact_phone || errors.contact_phone
                                    ? 'border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger)/20'
                                    : 'border-(--color-border-primary) focus:border-(--color-border-focus) focus:ring-(--color-brand-primary)/20'
                            }`}
                            placeholder="9876543210"
                            maxLength={10}
                        />
                        {(clientErrors.contact_phone || errors.contact_phone) && (
                            <p className="text-sm text-(--color-danger)">
                                {clientErrors.contact_phone || errors.contact_phone}
                            </p>
                        )}
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            Registered Address <span className="text-(--color-danger)">*</span>
                        </label>
                        <textarea
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            className="w-full px-4 py-3 bg-(--color-bg-primary) border border-(--color-border-primary) rounded-lg text-sm focus:border-(--color-border-focus) focus:ring-2 focus:ring-(--color-brand-primary)/20 outline-none transition-all min-h-[80px]"
                            placeholder="Full street address"
                        ></textarea>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            State <span className="text-(--color-danger)">*</span>
                        </label>
                        <FormSelect
                            value={data.state}
                            onChange={(value) => {
                                setData((prev) => ({ ...prev, state: value, city: '' }));
                                if (clientErrors.state) {
                                    setClientErrors((prev) => ({
                                        ...prev,
                                        state: validateState(value),
                                        city: '',
                                    }));
                                }
                            }}
                            placeholder="Select State"
                            options={INDIAN_STATES}
                            error={clientErrors.state || errors.state}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            City <span className="text-(--color-danger)">*</span>
                        </label>
                        <FormSelect
                            value={data.city}
                            onChange={(value) => {
                                setData('city', value);
                                if (clientErrors.city) {
                                    setClientErrors((prev) => ({
                                        ...prev,
                                        city: validateCity(value),
                                    }));
                                }
                            }}
                            placeholder={data.state ? 'Select City' : 'Select State first'}
                            options={cityOptions}
                            disabled={!data.state}
                            error={clientErrors.city || errors.city}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            Pincode <span className="text-(--color-danger)">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.pincode}
                            onChange={(e) => setData('pincode', e.target.value.replace(/\D/g, ''))}
                            className="w-full px-4 py-3 bg-(--color-bg-primary) border border-(--color-border-primary) rounded-lg text-sm focus:border-(--color-border-focus) focus:ring-2 focus:ring-(--color-brand-primary)/20 outline-none transition-all"
                            maxLength={6}
                            pattern="[0-9]{6}"
                            title="Exactly 6 digits"
                            placeholder="400001"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-gradient-primary text-white font-semibold rounded-lg shadow-token-primary hover:-translate-y-px hover:shadow-token-primary transition-all flex items-center gap-2 text-lg px-8 py-3"
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
