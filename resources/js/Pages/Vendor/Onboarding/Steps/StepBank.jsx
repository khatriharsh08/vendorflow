import { useForm, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';

export default function StepBank({ vendor, sessionData }) {
    const step2Session = sessionData?.step2 || {};
    const { data, setData, post, processing, errors } = useForm({
        bank_name: step2Session.bank_name || vendor?.bank_name || '',
        bank_account_number: step2Session.bank_account_number || vendor?.bank_account_number || '',
        bank_ifsc: step2Session.bank_ifsc || vendor?.bank_ifsc || '',
        bank_branch: step2Session.bank_branch || vendor?.bank_branch || '',
    });

    const [clientErrors, setClientErrors] = useState({});
    const [ifscLoading, setIfscLoading] = useState(false);
    const [ifscFetched, setIfscFetched] = useState(false);

    const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

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
        if (!IFSC_REGEX.test(value)) return 'IFSC must be in the format SBIN0001234 (4 letters, 0, 6 alphanumeric).';
        return '';
    };

    const validateBranch = (value) => {
        if (!value || value.trim() === '') return 'Branch Name is required.';
        return '';
    };

    const fetchBranchFromIfsc = useCallback(async (ifsc) => {
        if (!IFSC_REGEX.test(ifsc)) return;

        setIfscLoading(true);
        try {
            const response = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
            if (response.ok) {
                const result = await response.json();
                setData((prev) => ({
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
                bank_ifsc: 'Unable to verify IFSC code. Please check your connection.',
            }));
        } finally {
            setIfscLoading(false);
        }
    }, [setData]);

    const handleIfscChange = (e) => {
        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        setData('bank_ifsc', val);
        setIfscFetched(false);

        if (clientErrors.bank_ifsc) {
            setClientErrors((prev) => ({
                ...prev,
                bank_ifsc: validateIfsc(val),
            }));
        }

        // Auto-fetch when 11 characters entered
        if (val.length === 11 && IFSC_REGEX.test(val)) {
            fetchBranchFromIfsc(val);
        }
    };

    const handleIfscBlur = () => {
        const ifscErr = validateIfsc(data.bank_ifsc);
        setClientErrors((prev) => ({ ...prev, bank_ifsc: ifscErr }));
        if (!ifscErr && !ifscFetched) {
            fetchBranchFromIfsc(data.bank_ifsc);
        }
    };

    const submit = (e) => {
        e.preventDefault();

        const nameErr = validateBankName(data.bank_name);
        const accErr = validateAccountNumber(data.bank_account_number);
        const ifscErr = validateIfsc(data.bank_ifsc);
        const branchErr = validateBranch(data.bank_branch);

        if (nameErr || accErr || ifscErr || branchErr) {
            setClientErrors({
                bank_name: nameErr,
                bank_account_number: accErr,
                bank_ifsc: ifscErr,
                bank_branch: branchErr,
            });
            return;
        }

        setClientErrors({});
        post('/vendor/onboarding/step2');
    };

    const fieldClass = (field) =>
        `w-full px-4 py-3 bg-(--color-bg-primary) border rounded-lg text-sm focus:ring-2 outline-none transition-all ${
            clientErrors[field] || errors[field]
                ? 'border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger)/20'
                : 'border-(--color-border-primary) focus:border-(--color-border-focus) focus:ring-(--color-brand-primary)/20'
        }`;

    return (
        <div className="bg-(--color-bg-primary) border border-(--color-border-primary) rounded-2xl p-8 md:p-12 shadow-token-lg animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-(--color-text-primary)">
                    Bank Information
                </h1>
                <p className="text-(--color-text-tertiary)">
                    Add your bank details for payment processing.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            Bank Name <span className="text-(--color-danger)">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.bank_name}
                            onChange={(e) => {
                                setData('bank_name', e.target.value);
                                if (clientErrors.bank_name) {
                                    setClientErrors((prev) => ({
                                        ...prev,
                                        bank_name: validateBankName(e.target.value),
                                    }));
                                }
                            }}
                            onBlur={() => {
                                setClientErrors((prev) => ({
                                    ...prev,
                                    bank_name: validateBankName(data.bank_name),
                                }));
                            }}
                            className={`${fieldClass('bank_name')} ${ifscFetched ? 'bg-(--color-bg-secondary)' : ''}`}
                            placeholder="e.g., State Bank of India"
                            readOnly={ifscFetched}
                        />
                        {(clientErrors.bank_name || errors.bank_name) && (
                            <p className="text-sm text-(--color-danger)">
                                {clientErrors.bank_name || errors.bank_name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            Account Number <span className="text-(--color-danger)">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.bank_account_number}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setData('bank_account_number', val);
                                if (clientErrors.bank_account_number) {
                                    setClientErrors((prev) => ({
                                        ...prev,
                                        bank_account_number: validateAccountNumber(val),
                                    }));
                                }
                            }}
                            onBlur={() => {
                                setClientErrors((prev) => ({
                                    ...prev,
                                    bank_account_number: validateAccountNumber(data.bank_account_number),
                                }));
                            }}
                            className={fieldClass('bank_account_number')}
                            placeholder="9-18 digit account number"
                            maxLength={18}
                        />
                        {(clientErrors.bank_account_number || errors.bank_account_number) && (
                            <p className="text-sm text-(--color-danger)">
                                {clientErrors.bank_account_number || errors.bank_account_number}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            IFSC Code <span className="text-(--color-danger)">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={data.bank_ifsc}
                                onChange={handleIfscChange}
                                onBlur={handleIfscBlur}
                                className={`${fieldClass('bank_ifsc')} uppercase pr-10`}
                                placeholder="SBIN0001234"
                                maxLength={11}
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
                        {(clientErrors.bank_ifsc || errors.bank_ifsc) && (
                            <p className="text-sm text-(--color-danger)">
                                {clientErrors.bank_ifsc || errors.bank_ifsc}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            Branch Name <span className="text-(--color-danger)">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={data.bank_branch}
                                onChange={(e) => {
                                    setData('bank_branch', e.target.value);
                                    if (clientErrors.bank_branch) {
                                        setClientErrors((prev) => ({
                                            ...prev,
                                            bank_branch: validateBranch(e.target.value),
                                        }));
                                    }
                                }}
                                onBlur={() => {
                                    setClientErrors((prev) => ({
                                        ...prev,
                                        bank_branch: validateBranch(data.bank_branch),
                                    }));
                                }}
                                className={`${fieldClass('bank_branch')} ${ifscFetched ? 'bg-(--color-bg-secondary)' : ''}`}
                                placeholder={ifscLoading ? 'Fetching...' : 'Enter IFSC to auto-fill'}
                                readOnly={ifscFetched}
                            />
                            {ifscFetched && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-(--color-text-tertiary) bg-(--color-bg-secondary) px-2 py-0.5 rounded">
                                    Auto-filled
                                </span>
                            )}
                        </div>
                        {(clientErrors.bank_branch || errors.bank_branch) && (
                            <p className="text-sm text-(--color-danger)">
                                {clientErrors.bank_branch || errors.bank_branch}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-between pt-4">
                    <button
                        type="button"
                        onClick={() => router.get('/vendor/onboarding?step=1')}
                        className="px-6 py-3 rounded-xl border border-(--color-border-primary) text-(--color-text-secondary) hover:bg-(--color-bg-hover) transition-colors font-medium"
                    >
                        Back
                    </button>
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
