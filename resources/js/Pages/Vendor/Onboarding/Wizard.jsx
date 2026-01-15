import { useState, useEffect } from "react";
import { Head, useForm, router } from "@inertiajs/react";

export default function Wizard({
    auth,
    currentStep = 1,
    vendor,
    documentTypes,
    sessionData = {},
}) {
    const [step, setStep] = useState(currentStep);

    // Sync step with currentStep prop when it changes (e.g., after redirect)
    useEffect(() => {
        setStep(currentStep);
    }, [currentStep]);

    // Step 1 Form: Company Details - Use session data first, then vendor, then defaults
    const step1Session = sessionData?.step1 || {};
    const step1Form = useForm({
        company_name: step1Session.company_name || vendor?.company_name || "",
        registration_number: step1Session.registration_number || vendor?.registration_number || "",
        tax_id: step1Session.tax_id || vendor?.tax_id || "",
        pan_number: step1Session.pan_number || vendor?.pan_number || "",
        business_type: step1Session.business_type || vendor?.business_type || "",
        contact_person: step1Session.contact_person || vendor?.contact_person || auth.user.name,
        contact_phone: step1Session.contact_phone || vendor?.contact_phone || "",
        address: step1Session.address || vendor?.address || "",
        city: step1Session.city || vendor?.city || "",
        state: step1Session.state || vendor?.state || "",
        pincode: step1Session.pincode || vendor?.pincode || "",
    });

    // Step 2 Form: Bank Details - Use session data first, then vendor
    const step2Session = sessionData?.step2 || {};
    const step2Form = useForm({
        bank_name: step2Session.bank_name || vendor?.bank_name || "",
        bank_account_number: step2Session.bank_account_number || vendor?.bank_account_number || "",
        bank_ifsc: step2Session.bank_ifsc || vendor?.bank_ifsc || "",
        bank_branch: step2Session.bank_branch || vendor?.bank_branch || "",
    });

    // Step 3 Form: Documents
    const [uploadedDocs, setUploadedDocs] = useState([]);

    const steps = [
        { number: 1, title: "Company Details", icon: "🏢" },
        { number: 2, title: "Bank Information", icon: "🏦" },
        { number: 3, title: "Documents", icon: "📄" },
        { number: 4, title: "Review & Submit", icon: "✅" },
    ];

    const submitStep1 = (e) => {
        e.preventDefault();
        step1Form.post('/vendor/onboarding/step1');
    };

    const submitStep2 = (e) => {
        e.preventDefault();
        step2Form.post('/vendor/onboarding/step2');
    };

    const submitStep3 = (e) => {
        e.preventDefault();
        const formData = new FormData();
        uploadedDocs.forEach((doc, index) => {
            formData.append(`documents[${index}][document_type_id]`, doc.typeId);
            formData.append(`documents[${index}][file]`, doc.file);
        });
        router.post('/vendor/onboarding/step3', formData, { forceFormData: true });
    };

    const submitApplication = () => {
        router.post('/vendor/onboarding/submit');
    };

    const handleFileUpload = (typeId, file) => {
        setUploadedDocs((prev) => {
            const filtered = prev.filter((d) => d.typeId !== typeId);
            return [...filtered, { typeId, file, name: file.name }];
        });
    };

    return (
        <div className="min-h-screen bg-[var(--gradient-page)]">
            <Head title="Vendor Onboarding" />

            {/* Navigation - Light Theme */}
            <nav className="border-b border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--gradient-primary)] flex items-center justify-center shadow-[var(--shadow-primary)]">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="font-bold text-lg text-[var(--color-text-primary)]">VendorFlow Onboarding</span>
                    </div>
                    <div className="text-sm text-[var(--color-text-tertiary)]">
                        Welcome, {auth.user.name}
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-12">
                {/* Progress Steps - Light Theme */}
                <div className="mb-12">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--color-bg-muted)] -z-10 rounded-full"></div>
                        <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--gradient-primary)] -z-10 rounded-full transition-all duration-500"
                            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                        ></div>

                        {steps.map((s) => (
                            <div key={s.number} className="flex flex-col items-center gap-2">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-4 transition-all duration-300 ${
                                        step >= s.number
                                            ? "bg-[var(--color-bg-primary)] border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]"
                                            : "bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)] text-[var(--color-text-muted)]"
                                    } ${step === s.number ? "shadow-[var(--shadow-primary)] scale-110" : ""}`}
                                >
                                    {step > s.number ? "✓" : s.number}
                                </div>
                                <span className={`text-sm font-medium ${step >= s.number ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"}`}>
                                    {s.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step 1: Company Details */}
                {step === 1 && (
                    <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-2xl p-8 md:p-12 shadow-[var(--shadow-lg)] animate-fade-in">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2 text-[var(--color-text-primary)]">Company Information</h1>
                            <p className="text-[var(--color-text-tertiary)]">Tell us about your business entity.</p>
                        </div>

                        <form onSubmit={submitStep1} className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                                        Company Name <span className="text-[var(--color-danger)]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={step1Form.data.company_name}
                                        onChange={(e) => step1Form.setData("company_name", e.target.value)}
                                        className="input-field w-full"
                                        placeholder="Legal Entity Name"
                                    />
                                    {step1Form.errors.company_name && <p className="text-sm text-[var(--color-danger)]">{step1Form.errors.company_name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-text-secondary)]">Business Type</label>
                                    <select value={step1Form.data.business_type} onChange={(e) => step1Form.setData("business_type", e.target.value)} className="input-field w-full">
                                        <option value="">Select Type</option>
                                        <option value="sole_proprietor">Sole Proprietorship</option>
                                        <option value="partnership">Partnership</option>
                                        <option value="llp">LLP</option>
                                        <option value="pvt_ltd">Private Limited</option>
                                        <option value="public_ltd">Public Limited</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-text-secondary)]">Registration Number</label>
                                    <input type="text" value={step1Form.data.registration_number} onChange={(e) => step1Form.setData("registration_number", e.target.value)} className="input-field w-full" placeholder="CIN / LLPIN" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-text-secondary)]">GST Number</label>
                                    <input type="text" value={step1Form.data.tax_id} onChange={(e) => step1Form.setData("tax_id", e.target.value.toUpperCase())} className="input-field w-full uppercase" placeholder="22AAAAA0000A1Z5" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                                        PAN Number <span className="text-[var(--color-danger)]">*</span>
                                    </label>
                                    <input type="text" value={step1Form.data.pan_number} onChange={(e) => step1Form.setData("pan_number", e.target.value.toUpperCase())} className="input-field w-full uppercase" placeholder="ABCDE1234F" />
                                    {step1Form.errors.pan_number && <p className="text-sm text-[var(--color-danger)]">{step1Form.errors.pan_number}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                                        Contact Person <span className="text-[var(--color-danger)]">*</span>
                                    </label>
                                    <input type="text" value={step1Form.data.contact_person} onChange={(e) => step1Form.setData("contact_person", e.target.value)} className="input-field w-full" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                                        Phone Number <span className="text-[var(--color-danger)]">*</span>
                                    </label>
                                    <input type="tel" value={step1Form.data.contact_phone} onChange={(e) => step1Form.setData("contact_phone", e.target.value)} className="input-field w-full" placeholder="+91 98765 43210" />
                                    {step1Form.errors.contact_phone && <p className="text-sm text-[var(--color-danger)]">{step1Form.errors.contact_phone}</p>}
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                                        Registered Address <span className="text-[var(--color-danger)]">*</span>
                                    </label>
                                    <textarea value={step1Form.data.address} onChange={(e) => step1Form.setData("address", e.target.value)} className="input-field w-full min-h-[80px]" placeholder="Full street address"></textarea>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                                        City <span className="text-[var(--color-danger)]">*</span>
                                    </label>
                                    <input type="text" value={step1Form.data.city} onChange={(e) => step1Form.setData("city", e.target.value)} className="input-field w-full" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-text-secondary)]">State</label>
                                    <input type="text" value={step1Form.data.state} onChange={(e) => step1Form.setData("state", e.target.value)} className="input-field w-full" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                                        Pincode <span className="text-[var(--color-danger)]">*</span>
                                    </label>
                                    <input type="text" value={step1Form.data.pincode} onChange={(e) => step1Form.setData("pincode", e.target.value)} className="input-field w-full" />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button type="submit" disabled={step1Form.processing} className="btn-primary flex items-center gap-2 text-lg px-8 py-3">
                                    {step1Form.processing ? "Saving..." : "Save & Continue"}
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Step 2: Bank Information */}
                {step === 2 && (
                    <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-2xl p-8 md:p-12 shadow-[var(--shadow-lg)] animate-fade-in">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2 text-[var(--color-text-primary)]">Bank Information</h1>
                            <p className="text-[var(--color-text-tertiary)]">Add your bank details for payment processing.</p>
                        </div>

                        <form onSubmit={submitStep2} className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                                        Bank Name <span className="text-[var(--color-danger)]">*</span>
                                    </label>
                                    <input type="text" value={step2Form.data.bank_name} onChange={(e) => step2Form.setData("bank_name", e.target.value)} className="input-field w-full" placeholder="e.g., State Bank of India" />
                                    {step2Form.errors.bank_name && <p className="text-sm text-[var(--color-danger)]">{step2Form.errors.bank_name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                                        Account Number <span className="text-[var(--color-danger)]">*</span>
                                    </label>
                                    <input type="text" value={step2Form.data.bank_account_number} onChange={(e) => step2Form.setData("bank_account_number", e.target.value)} className="input-field w-full" placeholder="Account Number" />
                                    {step2Form.errors.bank_account_number && <p className="text-sm text-[var(--color-danger)]">{step2Form.errors.bank_account_number}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                                        IFSC Code <span className="text-[var(--color-danger)]">*</span>
                                    </label>
                                    <input type="text" value={step2Form.data.bank_ifsc} onChange={(e) => step2Form.setData("bank_ifsc", e.target.value.toUpperCase())} className="input-field w-full uppercase" placeholder="SBIN0001234" />
                                    {step2Form.errors.bank_ifsc && <p className="text-sm text-[var(--color-danger)]">{step2Form.errors.bank_ifsc}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-text-secondary)]">Branch Name</label>
                                    <input type="text" value={step2Form.data.bank_branch} onChange={(e) => step2Form.setData("bank_branch", e.target.value)} className="input-field w-full" placeholder="Branch Name" />
                                </div>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button type="button" onClick={() => router.get('/vendor/onboarding?step=1')} className="px-6 py-3 rounded-xl border border-[var(--color-border-primary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors font-medium">
                                    ← Back
                                </button>
                                <button type="submit" disabled={step2Form.processing} className="btn-primary flex items-center gap-2 text-lg px-8 py-3">
                                    {step2Form.processing ? "Saving..." : "Save & Continue"}
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Step 3: Documents */}
                {step === 3 && (
                    <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-2xl p-8 md:p-12 shadow-[var(--shadow-lg)] animate-fade-in">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2 text-[var(--color-text-primary)]">Upload Documents</h1>
                            <p className="text-[var(--color-text-tertiary)]">Upload required documents for verification. Files marked with * are mandatory.</p>
                        </div>

                        <form onSubmit={submitStep3} className="space-y-6">
                            <div className="grid gap-4">
                                {documentTypes?.map((docType) => (
                                    <div
                                        key={docType.id}
                                        className={`p-4 rounded-xl border transition-all ${
                                            uploadedDocs.find((d) => d.typeId === docType.id)
                                                ? "border-[var(--color-success)] bg-[var(--color-success-light)]"
                                                : "border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-[var(--color-text-primary)]">
                                                    {docType.display_name}
                                                    {docType.is_mandatory && <span className="text-[var(--color-danger)] ml-1">*</span>}
                                                </div>
                                                {docType.description && <p className="text-sm text-[var(--color-text-tertiary)] mt-1">{docType.description}</p>}
                                                {uploadedDocs.find((d) => d.typeId === docType.id) && (
                                                    <p className="text-sm text-[var(--color-success)] mt-2 flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        {uploadedDocs.find((d) => d.typeId === docType.id)?.name}
                                                    </p>
                                                )}
                                            </div>
                                            <label className="cursor-pointer">
                                                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => { if (e.target.files[0]) handleFileUpload(docType.id, e.target.files[0]); }} />
                                                <span className="px-4 py-2 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] hover:border-[var(--color-brand-primary)] text-[var(--color-text-secondary)] text-sm font-medium transition-colors">
                                                    {uploadedDocs.find((d) => d.typeId === docType.id) ? "Replace" : "Upload"}
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between pt-4">
                                <button type="button" onClick={() => router.get('/vendor/onboarding?step=2')} className="px-6 py-3 rounded-xl border border-[var(--color-border-primary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors font-medium">
                                    ← Back
                                </button>
                                <button type="submit" className="btn-primary flex items-center gap-2 text-lg px-8 py-3">
                                    Save & Continue
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Step 4: Review & Submit */}
                {step === 4 && (
                    <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-2xl p-8 md:p-12 shadow-[var(--shadow-lg)] animate-fade-in">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2 text-[var(--color-text-primary)]">Review & Submit</h1>
                            <p className="text-[var(--color-text-tertiary)]">Please review your information before submitting.</p>
                        </div>

                        <div className="space-y-6">
                            {/* Company Summary */}
                            <div className="p-6 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-secondary)]">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 text-[var(--color-text-primary)]">
                                        <span>🏢</span> Company Details
                                    </h3>
                                    <button onClick={() => router.get('/vendor/onboarding?step=1')} className="text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-hover)] text-sm font-medium">
                                        Edit
                                    </button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-[var(--color-text-tertiary)]">Company:</span> <span className="text-[var(--color-text-primary)] ml-2 font-medium">{step1Session.company_name || vendor?.company_name}</span></div>
                                    <div><span className="text-[var(--color-text-tertiary)]">PAN:</span> <span className="text-[var(--color-text-primary)] ml-2 font-medium">{step1Session.pan_number || vendor?.pan_number}</span></div>
                                    <div><span className="text-[var(--color-text-tertiary)]">GST:</span> <span className="text-[var(--color-text-primary)] ml-2 font-medium">{step1Session.tax_id || vendor?.tax_id || "N/A"}</span></div>
                                    <div><span className="text-[var(--color-text-tertiary)]">Contact:</span> <span className="text-[var(--color-text-primary)] ml-2 font-medium">{step1Session.contact_person || vendor?.contact_person}</span></div>
                                    <div><span className="text-[var(--color-text-tertiary)]">Phone:</span> <span className="text-[var(--color-text-primary)] ml-2 font-medium">{step1Session.contact_phone || vendor?.contact_phone}</span></div>
                                    <div><span className="text-[var(--color-text-tertiary)]">City:</span> <span className="text-[var(--color-text-primary)] ml-2 font-medium">{step1Session.city || vendor?.city}</span></div>
                                </div>
                            </div>

                            {/* Bank Summary */}
                            <div className="p-6 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-secondary)]">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 text-[var(--color-text-primary)]">
                                        <span>🏦</span> Bank Details
                                    </h3>
                                    <button onClick={() => router.get('/vendor/onboarding?step=2')} className="text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-hover)] text-sm font-medium">
                                        Edit
                                    </button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-[var(--color-text-tertiary)]">Bank:</span> <span className="text-[var(--color-text-primary)] ml-2 font-medium">{step2Session.bank_name || vendor?.bank_name}</span></div>
                                    <div><span className="text-[var(--color-text-tertiary)]">Account:</span> <span className="text-[var(--color-text-primary)] ml-2 font-medium">****{(step2Session.bank_account_number || vendor?.bank_account_number)?.slice(-4)}</span></div>
                                    <div><span className="text-[var(--color-text-tertiary)]">IFSC:</span> <span className="text-[var(--color-text-primary)] ml-2 font-medium">{step2Session.bank_ifsc || vendor?.bank_ifsc}</span></div>
                                    <div><span className="text-[var(--color-text-tertiary)]">Branch:</span> <span className="text-[var(--color-text-primary)] ml-2 font-medium">{step2Session.bank_branch || vendor?.bank_branch || "N/A"}</span></div>
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="p-4 rounded-xl border border-[var(--color-warning)] bg-[var(--color-warning-light)]">
                                <p className="text-sm text-[var(--color-warning-dark)]">
                                    <strong>Important:</strong> By submitting this application, you confirm that all information provided is accurate and complete. Your application will be reviewed by our operations team.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-between pt-8">
                            <button type="button" onClick={() => router.get('/vendor/onboarding?step=3')} className="px-6 py-3 rounded-xl border border-[var(--color-border-primary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors font-medium">
                                ← Back
                            </button>
                            <button onClick={submitApplication} className="btn-primary flex items-center gap-2 text-lg px-8 py-3">
                                Submit Application
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
