import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import StepCompany from './Steps/StepCompany';
import StepBank from './Steps/StepBank';
import StepDocuments from './Steps/StepDocuments';
import StepReview from './Steps/StepReview';

export default function Wizard({ auth, currentStep = 1, vendor, documentTypes, sessionData = {} }) {
    const [step, setStep] = useState(currentStep);

    // Sync step with currentStep prop when it changes (e.g., after redirect)
    useEffect(() => {
        setStep(currentStep);
    }, [currentStep]);

    const steps = [
        { number: 1, title: 'Company Details', icon: '🏢' },
        { number: 2, title: 'Bank Information', icon: '🏦' },
        { number: 3, title: 'Documents', icon: '📄' },
        { number: 4, title: 'Review & Submit', icon: '✅' },
    ];

    return (
        <div className="min-h-screen bg-(--gradient-page)">
            <Head title="Vendor Onboarding" />

            {/* Navigation - Light Theme */}
            <nav className="border-b border-(--color-border-primary) bg-(--color-bg-primary)/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-(--gradient-primary) flex items-center justify-center shadow-(--shadow-primary)">
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </div>
                        <span className="font-bold text-lg text-(--color-text-primary)">
                            VendorFlow Onboarding
                        </span>
                    </div>
                    <div className="text-sm text-(--color-text-tertiary)">
                        Welcome, {auth.user.name}
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-12">
                {/* Progress Steps - Light Theme */}
                <div className="mb-12">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-(--color-bg-muted) -z-10 rounded-full"></div>
                        <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-(--gradient-primary) -z-10 rounded-full transition-all duration-500"
                            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                        ></div>

                        {steps.map((s) => (
                            <div key={s.number} className="flex flex-col items-center gap-2">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-4 transition-all duration-300 ${
                                        step >= s.number
                                            ? 'bg-(--color-bg-primary) border-(--color-brand-primary) text-(--color-brand-primary)'
                                            : 'bg-(--color-bg-secondary) border-(--color-border-primary) text-(--color-text-muted)'
                                    } ${step === s.number ? 'shadow-(--shadow-primary) scale-110' : ''}`}
                                >
                                    {step > s.number ? '✓' : s.number}
                                </div>
                                <span
                                    className={`text-sm font-medium ${step >= s.number ? 'text-(--color-text-primary)' : 'text-(--color-text-muted)'}`}
                                >
                                    {s.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Steps Content */}
                {step === 1 && <StepCompany vendor={vendor} sessionData={sessionData} />}
                {step === 2 && <StepBank vendor={vendor} sessionData={sessionData} />}
                {step === 3 && (
                    <StepDocuments documentTypes={documentTypes} sessionData={sessionData} />
                )}
                {step === 4 && (
                    <StepReview
                        vendor={vendor}
                        sessionData={sessionData}
                        documentTypes={documentTypes}
                    />
                )}
            </main>
        </div>
    );
}
