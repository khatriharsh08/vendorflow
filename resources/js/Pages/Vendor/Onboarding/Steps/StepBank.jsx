import { useForm, router } from '@inertiajs/react';

export default function StepBank({ vendor, sessionData }) {
    const step2Session = sessionData?.step2 || {};
    const { data, setData, post, processing, errors } = useForm({
        bank_name: step2Session.bank_name || vendor?.bank_name || '',
        bank_account_number: step2Session.bank_account_number || vendor?.bank_account_number || '',
        bank_ifsc: step2Session.bank_ifsc || vendor?.bank_ifsc || '',
        bank_branch: step2Session.bank_branch || vendor?.bank_branch || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/vendor/onboarding/step2');
    };

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
                            onChange={(e) => setData('bank_name', e.target.value)}
                            className="w-full px-4 py-3 bg-(--color-bg-primary) border border-(--color-border-primary) rounded-lg text-sm focus:border-(--color-border-focus) focus:ring-2 focus:ring-(--color-brand-primary)/20 outline-none transition-all"
                            placeholder="e.g., State Bank of India"
                        />
                        {errors.bank_name && (
                            <p className="text-sm text-(--color-danger)">{errors.bank_name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            Account Number <span className="text-(--color-danger)">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.bank_account_number}
                            onChange={(e) => setData('bank_account_number', e.target.value)}
                            className="w-full px-4 py-3 bg-(--color-bg-primary) border border-(--color-border-primary) rounded-lg text-sm focus:border-(--color-border-focus) focus:ring-2 focus:ring-(--color-brand-primary)/20 outline-none transition-all"
                            placeholder="Account Number"
                        />
                        {errors.bank_account_number && (
                            <p className="text-sm text-(--color-danger)">
                                {errors.bank_account_number}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            IFSC Code <span className="text-(--color-danger)">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.bank_ifsc}
                            onChange={(e) => setData('bank_ifsc', e.target.value.toUpperCase())}
                            className="w-full px-4 py-3 bg-(--color-bg-primary) border border-(--color-border-primary) rounded-lg text-sm focus:border-(--color-border-focus) focus:ring-2 focus:ring-(--color-brand-primary)/20 outline-none transition-all uppercase"
                            placeholder="SBIN0001234"
                        />
                        {errors.bank_ifsc && (
                            <p className="text-sm text-(--color-danger)">{errors.bank_ifsc}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--color-text-secondary)">
                            Branch Name
                        </label>
                        <input
                            type="text"
                            value={data.bank_branch}
                            onChange={(e) => setData('bank_branch', e.target.value)}
                            className="w-full px-4 py-3 bg-(--color-bg-primary) border border-(--color-border-primary) rounded-lg text-sm focus:border-(--color-border-focus) focus:ring-2 focus:ring-(--color-brand-primary)/20 outline-none transition-all"
                            placeholder="Branch Name"
                        />
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
