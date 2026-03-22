import { usePage, useForm } from '@inertiajs/react';
import { useState, useMemo, useCallback } from 'react';
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
import { formatDate } from '@/utils/dateFormatters';
import { INDIAN_STATES, getCitiesForState } from '@/data/indianStatesAndCities';

export default function Profile({ vendor }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('company');
    const [clientErrors, setClientErrors] = useState({});

    // IFSC auto-lookup state
    const [ifscLoading, setIfscLoading] = useState(false);
    const [ifscFetched, setIfscFetched] = useState(false);

    const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

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

    const cityOptions = useMemo(() => getCitiesForState(form.data.state), [form.data.state]);

    // --- Contact Validations ---
    const validateContactPerson = (value) => {
        if (!value || value.trim() === '') return 'Contact Person is required.';
        return '';
    };

    const validatePhoneNumber = (value) => {
        if (!value || value.trim() === '') return 'Phone Number is required.';
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length !== 10) return 'Phone Number must be exactly 10 digits.';
        return '';
    };

    const validateAddress = (value) => {
        if (!value || value.trim() === '') return 'Address is required.';
        return '';
    };

    const validateState = (value) => {
        if (!value || value.trim() === '') return 'State is required.';
        return '';
    };

    const validateCity = (value) => {
        if (!value || value.trim() === '') return 'City is required.';
        return '';
    };

    const validatePincode = (value) => {
        if (!value || value.trim() === '') return 'Pincode is required.';
        if (!/^[0-9]{6}$/.test(value)) return 'Pincode must be exactly 6 digits.';
        return '';
    };

    // --- Bank Validations ---
    const validateBankName = (value) => {
        if (!value || value.trim() === '') return 'Bank Name is required.';
        return '';
    };

    const validateAccountNumber = (value) => {
        if (!value || value.trim() === '') return 'Account Number is required.';
        if (!/^[0-9]{9,18}$/.test(value)) return 'Account number must be 9 to 18 digits.';
        return '';
    };

    const validateIfsc = (value) => {
        if (!value || value.trim() === '') return 'IFSC Code is required.';
        if (!IFSC_REGEX.test(value)) return 'IFSC must be in format SBIN0001234.';
        return '';
    };

    const validateBranch = (value) => {
        if (!value || value.trim() === '') return 'Branch Name is required.';
        return '';
    };

    // IFSC auto-lookup
    const fetchBranchFromIfsc = useCallback(async (ifsc) => {
        if (!IFSC_REGEX.test(ifsc)) return;
        setIfscLoading(true);
        try {
            const response = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
            if (response.ok) {
                const result = await response.json();
                form.setData((prev) => ({
                    ...prev,
                    bank_branch: result.BRANCH || '',
                    bank_name: result.BANK || prev.bank_name,
                }));
                setIfscFetched(true);
                setClientErrors((prev) => ({
                    ...prev,
                    bank_branch: '',
                    bank_name: '',
                    bank_ifsc: '',
                }));
            } else {
                setIfscFetched(false);
                setClientErrors((prev) => ({
                    ...prev,
                    bank_ifsc: 'Invalid IFSC code. Could not find bank details.',
                }));
            }
        } catch {
            setIfscFetched(false);
            setClientErrors((prev) => ({
                ...prev,
                bank_ifsc: 'Unable to verify IFSC code. Check your connection.',
            }));
        } finally {
            setIfscLoading(false);
        }
    }, [form]);

    const handleSubmit = (e) => {
        e.preventDefault();

        let hasError = false;
        const newErrors = {};

        if (activeTab === 'contact') {
            newErrors.contact_person = validateContactPerson(form.data.contact_person);
            newErrors.contact_phone = validatePhoneNumber(form.data.contact_phone);
            newErrors.address = validateAddress(form.data.address);
            newErrors.state = validateState(form.data.state);
            newErrors.city = validateCity(form.data.city);
            newErrors.pincode = validatePincode(form.data.pincode);
            hasError = Object.values(newErrors).some((e) => e !== '');
        }

        if (activeTab === 'bank') {
            newErrors.bank_name = validateBankName(form.data.bank_name);
            newErrors.bank_account_number = validateAccountNumber(form.data.bank_account_number);
            newErrors.bank_ifsc = validateIfsc(form.data.bank_ifsc);
            newErrors.bank_branch = validateBranch(form.data.bank_branch);
            hasError = Object.values(newErrors).some((e) => e !== '');
        }

        if (hasError) {
            setClientErrors(newErrors);
            return;
        }

        setClientErrors({});
        form.put('/vendor/profile', {
            onSuccess: () => setIsEditing(false),
        });
    };

    const getError = (field) => clientErrors[field] || form.errors[field] || '';

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
                    {!isEditing && vendor?.status !== 'draft' && activeTab !== 'company' && activeTab !== 'status' && (
                        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    )}
                </div>
            }
        />
    );

    // Helper for input field class with error styling
    const inputClass = (field) =>
        `w-full px-4 py-3 bg-(--color-bg-primary) border rounded-lg text-sm focus:ring-2 outline-none transition-all ${
            getError(field)
                ? 'border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger)/20'
                : 'border-(--color-border-primary) focus:border-(--color-border-focus) focus:ring-(--color-brand-primary)/20'
        }`;

    return (
        <VendorLayout title="Profile" activeNav="Profile" header={header} vendor={vendor}>
            <div className="space-y-6">
                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-(--color-bg-secondary) rounded-xl border border-(--color-border-secondary)">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                                setActiveTab(tab.id);
                                setClientErrors({});
                                if (tab.id === 'company' || tab.id === 'status') {
                                    setIsEditing(false);
                                }
                            }}
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
                    {/* ===== Company Details Tab (ALWAYS DISABLED) ===== */}
                    {activeTab === 'company' && (
                        <Card title="Company Details">
                            <div className="grid md:grid-cols-2 gap-6 p-6">
                                <FormInput
                                    label="Company Name"
                                    value={form.data.company_name}
                                    onChange={() => {}}
                                    required
                                    disabled={true}
                                />
                                <FormInput
                                    label="Registration Number (CIN / LLPIN)"
                                    value={form.data.registration_number}
                                    onChange={() => {}}
                                    disabled={true}
                                />
                                <FormInput
                                    label="GST Number"
                                    value={form.data.tax_id}
                                    onChange={() => {}}
                                    disabled={true}
                                />
                                <FormInput
                                    label="PAN Number"
                                    value={form.data.pan_number}
                                    onChange={() => {}}
                                    required
                                    disabled={true}
                                />
                                <div className="md:col-span-2">
                                    <FormSelect
                                        label="Business Type"
                                        value={form.data.business_type}
                                        onChange={() => {}}
                                        options={[
                                            { value: 'sole_proprietor', label: 'Sole Proprietorship' },
                                            { value: 'partnership', label: 'Partnership' },
                                            { value: 'pvt_ltd', label: 'Private Limited' },
                                            { value: 'public_ltd', label: 'Public Limited' },
                                            { value: 'llp', label: 'LLP' },
                                        ]}
                                        disabled={true}
                                    />
                                </div>
                                <div className="md:col-span-2 p-4 bg-(--color-bg-secondary) rounded-xl">
                                    <p className="text-sm text-(--color-text-tertiary) flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Company details cannot be edited after submission. Contact admin for changes.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* ===== Contact Info Tab (EDITABLE with Validations) ===== */}
                    {activeTab === 'contact' && (
                        <Card title="Contact Information">
                            <div className="grid md:grid-cols-2 gap-6 p-6">
                                {/* Contact Person */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-(--color-text-secondary)">
                                        Contact Person <span className="text-(--color-danger)">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.contact_person}
                                        onChange={(e) => {
                                            form.setData('contact_person', e.target.value);
                                            if (clientErrors.contact_person) {
                                                setClientErrors((prev) => ({
                                                    ...prev,
                                                    contact_person: validateContactPerson(e.target.value),
                                                }));
                                            }
                                        }}
                                        onBlur={() => {
                                            if (isEditing) {
                                                setClientErrors((prev) => ({
                                                    ...prev,
                                                    contact_person: validateContactPerson(form.data.contact_person),
                                                }));
                                            }
                                        }}
                                        className={inputClass('contact_person')}
                                        placeholder="Full name of contact person"
                                        disabled={!isEditing}
                                    />
                                    {getError('contact_person') && (
                                        <p className="text-sm text-(--color-danger)">{getError('contact_person')}</p>
                                    )}
                                </div>

                                {/* Phone Number */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-(--color-text-secondary)">
                                        Phone Number <span className="text-(--color-danger)">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={form.data.contact_phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            form.setData('contact_phone', val);
                                            if (clientErrors.contact_phone) {
                                                setClientErrors((prev) => ({
                                                    ...prev,
                                                    contact_phone: validatePhoneNumber(val),
                                                }));
                                            }
                                        }}
                                        onBlur={() => {
                                            if (isEditing) {
                                                setClientErrors((prev) => ({
                                                    ...prev,
                                                    contact_phone: validatePhoneNumber(form.data.contact_phone),
                                                }));
                                            }
                                        }}
                                        className={inputClass('contact_phone')}
                                        placeholder="9876543210"
                                        maxLength={10}
                                        disabled={!isEditing}
                                    />
                                    {getError('contact_phone') && (
                                        <p className="text-sm text-(--color-danger)">{getError('contact_phone')}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <FormInput
                                    label="Email Address"
                                    type="email"
                                    value={form.data.contact_email}
                                    onChange={() => {}}
                                    disabled={true}
                                />

                                {/* Address */}
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium text-(--color-text-secondary)">
                                        Registered Address <span className="text-(--color-danger)">*</span>
                                    </label>
                                    <textarea
                                        value={form.data.address}
                                        onChange={(e) => {
                                            form.setData('address', e.target.value);
                                            if (clientErrors.address) {
                                                setClientErrors((prev) => ({
                                                    ...prev,
                                                    address: validateAddress(e.target.value),
                                                }));
                                            }
                                        }}
                                        onBlur={() => {
                                            if (isEditing) {
                                                setClientErrors((prev) => ({
                                                    ...prev,
                                                    address: validateAddress(form.data.address),
                                                }));
                                            }
                                        }}
                                        className={`${inputClass('address')} min-h-[80px]`}
                                        placeholder="Full street address"
                                        disabled={!isEditing}
                                    />
                                    {getError('address') && (
                                        <p className="text-sm text-(--color-danger)">{getError('address')}</p>
                                    )}
                                </div>

                                {/* State Dropdown */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-(--color-text-secondary)">
                                        State <span className="text-(--color-danger)">*</span>
                                    </label>
                                    <FormSelect
                                        value={form.data.state}
                                        onChange={(value) => {
                                            form.setData((prev) => ({ ...prev, state: value, city: '' }));
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
                                        error={getError('state')}
                                        disabled={!isEditing}
                                    />
                                </div>

                                {/* City Dropdown */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-(--color-text-secondary)">
                                        City <span className="text-(--color-danger)">*</span>
                                    </label>
                                    <FormSelect
                                        value={form.data.city}
                                        onChange={(value) => {
                                            form.setData('city', value);
                                            if (clientErrors.city) {
                                                setClientErrors((prev) => ({
                                                    ...prev,
                                                    city: validateCity(value),
                                                }));
                                            }
                                        }}
                                        placeholder={form.data.state ? 'Select City' : 'Select State first'}
                                        options={cityOptions}
                                        disabled={!isEditing || !form.data.state}
                                        error={getError('city')}
                                    />
                                </div>

                                {/* Pincode */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-(--color-text-secondary)">
                                        Pincode <span className="text-(--color-danger)">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.pincode}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            form.setData('pincode', val);
                                            if (clientErrors.pincode) {
                                                setClientErrors((prev) => ({
                                                    ...prev,
                                                    pincode: validatePincode(val),
                                                }));
                                            }
                                        }}
                                        onBlur={() => {
                                            if (isEditing) {
                                                setClientErrors((prev) => ({
                                                    ...prev,
                                                    pincode: validatePincode(form.data.pincode),
                                                }));
                                            }
                                        }}
                                        className={inputClass('pincode')}
                                        placeholder="6-digit pincode"
                                        maxLength={6}
                                        disabled={!isEditing}
                                    />
                                    {getError('pincode') && (
                                        <p className="text-sm text-(--color-danger)">{getError('pincode')}</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* ===== Bank Details Tab (EDITABLE with Validations) ===== */}
                    {activeTab === 'bank' && (
                        <Card title="Bank Details">
                            <div className="grid md:grid-cols-2 gap-6 p-6">
                                {/* Bank Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-(--color-text-secondary)">
                                        Bank Name <span className="text-(--color-danger)">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.bank_name}
                                        onChange={(e) => {
                                            form.setData('bank_name', e.target.value);
                                            if (clientErrors.bank_name) {
                                                setClientErrors((prev) => ({
                                                    ...prev,
                                                    bank_name: validateBankName(e.target.value),
                                                }));
                                            }
                                        }}
                                        onBlur={() => {
                                            if (isEditing) {
                                                setClientErrors((prev) => ({
                                                    ...prev,
                                                    bank_name: validateBankName(form.data.bank_name),
                                                }));
                                            }
                                        }}
                                        className={`${inputClass('bank_name')} ${ifscFetched ? 'bg-(--color-bg-secondary)' : ''}`}
                                        placeholder="e.g., State Bank of India"
                                        readOnly={ifscFetched}
                                        disabled={!isEditing}
                                    />
                                    {getError('bank_name') && (
                                        <p className="text-sm text-(--color-danger)">{getError('bank_name')}</p>
                                    )}
                                </div>

                                {/* Account Number */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-(--color-text-secondary)">
                                        Account Number <span className="text-(--color-danger)">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.bank_account_number}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            form.setData('bank_account_number', val);
                                            if (clientErrors.bank_account_number) {
                                                setClientErrors((prev) => ({
                                                    ...prev,
                                                    bank_account_number: validateAccountNumber(val),
                                                }));
                                            }
                                        }}
                                        onBlur={() => {
                                            if (isEditing) {
                                                setClientErrors((prev) => ({
                                                    ...prev,
                                                    bank_account_number: validateAccountNumber(form.data.bank_account_number),
                                                }));
                                            }
                                        }}
                                        className={inputClass('bank_account_number')}
                                        placeholder="9-18 digit account number"
                                        maxLength={18}
                                        disabled={!isEditing}
                                    />
                                    {getError('bank_account_number') && (
                                        <p className="text-sm text-(--color-danger)">{getError('bank_account_number')}</p>
                                    )}
                                </div>

                                {/* IFSC Code */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-(--color-text-secondary)">
                                        IFSC Code <span className="text-(--color-danger)">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={form.data.bank_ifsc}
                                            onChange={(e) => {
                                                const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                                form.setData('bank_ifsc', val);
                                                setIfscFetched(false);
                                                if (clientErrors.bank_ifsc) {
                                                    setClientErrors((prev) => ({
                                                        ...prev,
                                                        bank_ifsc: validateIfsc(val),
                                                    }));
                                                }
                                                if (val.length === 11 && IFSC_REGEX.test(val)) {
                                                    fetchBranchFromIfsc(val);
                                                }
                                            }}
                                            onBlur={() => {
                                                if (isEditing) {
                                                    const ifscErr = validateIfsc(form.data.bank_ifsc);
                                                    setClientErrors((prev) => ({ ...prev, bank_ifsc: ifscErr }));
                                                    if (!ifscErr && !ifscFetched) {
                                                        fetchBranchFromIfsc(form.data.bank_ifsc);
                                                    }
                                                }
                                            }}
                                            className={`${inputClass('bank_ifsc')} uppercase pr-10`}
                                            placeholder="SBIN0001234"
                                            maxLength={11}
                                            disabled={!isEditing}
                                        />
                                        {ifscLoading && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <svg className="animate-spin h-5 w-5 text-(--color-brand-primary)" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                            </div>
                                        )}
                                        {ifscFetched && !ifscLoading && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <svg className="h-5 w-5 text-(--color-success)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    {getError('bank_ifsc') && (
                                        <p className="text-sm text-(--color-danger)">{getError('bank_ifsc')}</p>
                                    )}
                                </div>

                                {/* Branch Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-(--color-text-secondary)">
                                        Branch Name <span className="text-(--color-danger)">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={form.data.bank_branch}
                                            onChange={(e) => {
                                                form.setData('bank_branch', e.target.value);
                                                if (clientErrors.bank_branch) {
                                                    setClientErrors((prev) => ({
                                                        ...prev,
                                                        bank_branch: validateBranch(e.target.value),
                                                    }));
                                                }
                                            }}
                                            onBlur={() => {
                                                if (isEditing) {
                                                    setClientErrors((prev) => ({
                                                        ...prev,
                                                        bank_branch: validateBranch(form.data.bank_branch),
                                                    }));
                                                }
                                            }}
                                            className={`${inputClass('bank_branch')} ${ifscFetched ? 'bg-(--color-bg-secondary)' : ''}`}
                                            placeholder={ifscLoading ? 'Fetching...' : 'Enter IFSC to auto-fill'}
                                            readOnly={ifscFetched}
                                            disabled={!isEditing}
                                        />
                                        {ifscFetched && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-(--color-text-tertiary) bg-(--color-bg-secondary) px-2 py-0.5 rounded">
                                                Auto-filled
                                            </span>
                                        )}
                                    </div>
                                    {getError('bank_branch') && (
                                        <p className="text-sm text-(--color-danger)">{getError('bank_branch')}</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* ===== Account Status Tab ===== */}
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
                                                {vendor?.status?.replaceAll('_', ' ') || 'Draft'}
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
                                                ? formatDate(vendor.created_at)
                                                : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Action Buttons - Only show on editable tabs */}
                    {isEditing && (activeTab === 'contact' || activeTab === 'bank') && (
                        <div className="flex justify-end gap-3 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsEditing(false);
                                    setClientErrors({});
                                    setIfscFetched(false);
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
