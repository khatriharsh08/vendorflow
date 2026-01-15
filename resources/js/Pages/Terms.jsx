import { GuestLayout } from '@/Components';

export default function Terms() {
    const sections = [
        { id: 'acceptance', title: '1. Acceptance of Terms' },
        { id: 'service', title: '2. Description of Service' },
        { id: 'accounts', title: '3. User Accounts' },
        { id: 'usage', title: '4. Acceptable Use' },
        { id: 'data', title: '5. Vendor Data & Responsibility' },
        { id: 'payment', title: '6. Payment Terms' },
        { id: 'ip', title: '7. Intellectual Property' },
        { id: 'liability', title: '8. Limitation of Liability' },
        { id: 'termination', title: '9. Termination' },
        { id: 'governing', title: '10. Governing Law' },
    ];

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <GuestLayout title="Terms of Service - VendorFlow">
            <div className="bg-white min-h-screen">
                {/* Header */}
                <div className="bg-gray-50 border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-gray-200 text-indigo-600 text-xs font-bold uppercase tracking-wide mb-6 shadow-sm">
                                Effective Date: January 15, 2026
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">Terms of Service</h1>
                            <p className="text-xl text-gray-600 leading-relaxed">
                                Please read these terms carefully. They state the rules for using VendorFlow for your business.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
                    <div className="grid lg:grid-cols-12 gap-12">
                        {/* Sidebar Navigation */}
                        <div className="hidden lg:block lg:col-span-3">
                            <div className="sticky top-8 space-y-1">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3">Contents</h3>
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors border-l-2 border-transparent hover:border-indigo-100 truncate"
                                    >
                                        {section.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="lg:col-span-9">
                            <div className="prose prose-lg prose-indigo max-w-none prose-li:my-3 prose-p:leading-loose prose-p:text-gray-600 prose-headings:mb-6 prose-headings:text-gray-900 prose-li:text-gray-600">
                                <p className="lead text-gray-600">
                                    By accessing or using our platform, you agree to be bound by these Terms and our Privacy Policy. 
                                    If you do not agree to these Terms, you may not access or use our services.
                                </p>

                                <hr className="my-12 border-gray-100" />

                                <section id="acceptance" className="scroll-mt-24">
                                    <h3 className="font-bold text-gray-900 mb-2">1. Acceptance of Terms</h3>
                                    <p className="text-sm text-gray-600 mb-0">
                                        By accessing and using VendorFlow, you acknowledge that you have read, understood, and agree 
                                        to be bound by these Terms and our Privacy Policy. These Terms apply to all visitors, users, 
                                        and others who access or use the Service.
                                    </p>
                                </section>
                                <br />

                                <section id="service" className="scroll-mt-24">
                                    <h3 className="font-bold text-gray-900 mb-2">2. Description of Service</h3>
                                    <p className="text-sm text-gray-600 mb-0">
                                        VendorFlow is a comprehensive vendor management platform that enables businesses to streamline 
                                        vendor onboarding, verify documents, track compliance, and process payments. We assume no 
                                        responsibility for any interactions between vendors and businesses outside the scope of our 
                                        platform's functionality.
                                    </p>
                                </section>
                                <br />

                                <section id="accounts" className="scroll-mt-24">
                                    <h3 className="font-bold text-gray-900 mb-2">3. User Accounts</h3>
                                    <p className="text-sm text-gray-600 mb-0">
                                        When you create an account with us, you must provide us information that is accurate, complete, 
                                        and current at all times. Failure to do so constitutes a breach of the Terms, which may result 
                                        in immediate termination of your account on our Service.
                                    </p>
                                    <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 my-6 not-prose">
                                        <h4 className="font-bold text-indigo-900 mb-2 text-sm uppercase">You are responsible for:</h4>
                                        <ul className="list-disc pl-4 space-y-2 text-sm text-indigo-900">
                                            <li>Safeguarding the password that you use to access the Service.</li>
                                            <li>Any activities or actions under your password.</li>
                                            <li>Notifying us immediately upon becoming aware of any breach of security.</li>
                                        </ul>
                                    </div>
                                </section>
                                <br />

                                <section id="usage" className="scroll-mt-24">
                                    <h3 className="font-bold text-gray-900 mb-2">4. Acceptable Use</h3>
                                    <p className="text-sm text-gray-600 mb-1">
                                        You agree not to use the Service in any way that violates any applicable national or international 
                                        law or regulation. Additionally, you agree not to:
                                    </p>
                                    <ul className="space-y-2 text-sm text-gray-600 mb-0">
                                        <li>Upload irrelevant, obscene, defamatory, or unlawful content.</li>
                                        <li>Attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Service.</li>
                                        <li>Use any robot, spider, or other automatic device to access the Service for any purpose.</li>
                                        <li>Introduce any viruses, trojan horses, worms, logic bombs, or other material that is malicious.</li>
                                    </ul>
                                </section>
                                <br />

                                <section id="data" className="scroll-mt-24">
                                    <h3 className="font-bold text-gray-900 mb-2">5. Vendor Data & Responsibility</h3>
                                    <p className="text-sm text-gray-600 mb-0">
                                        You retain all rights to the data you upload to VendorFlow. By uploading data, you grant us 
                                        a license to use, store, and display that data solely for the purpose of providing the service to you.
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2 mb-0">
                                        We take data accuracy seriously, but you are ultimately responsible for verifying the authenticity 
                                        of the documents and information provided by vendors or businesses on our platform.
                                    </p>
                                </section>
                                <br />

                                <section id="payment" className="scroll-mt-24">
                                    <h3 className="font-bold text-gray-900 mb-2">6. Payment Terms</h3>
                                    <p className="text-sm text-gray-600 mb-0">
                                        Certain aspects of the Service may be provided for a fee or other charge. If you elect to use 
                                        paid aspects of the Service, you agree to the pricing and payment terms as we may update them 
                                        from time to time.
                                    </p>
                                </section>
                                <br />

                                <section id="ip" className="scroll-mt-24">
                                    <h3 className="font-bold text-gray-900 mb-2">7. Intellectual Property</h3>
                                    <p className="text-sm text-gray-600 mb-0">
                                        The Service and its original content (excluding Content provided by users), features, and functionality 
                                        are and will remain the exclusive property of VendorFlow Technologies and its licensors.
                                    </p>
                                </section>
                                <br />

                                <section id="liability" className="scroll-mt-24">
                                    <h3 className="font-bold text-gray-900 mb-2">8. Limitation of Liability</h3>
                                    <p className="text-sm text-gray-600 mb-0">
                                        In no event shall VendorFlow, nor its directors, employees, partners, agents, suppliers, or 
                                        affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, 
                                        including without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
                                        resulting from your access to or use of or inability to access or use the Service.
                                    </p>
                                </section>
                                <br />

                                <section id="termination" className="scroll-mt-24">
                                    <h3 className="font-bold text-gray-900 mb-2">9. Termination</h3>
                                    <p className="text-sm text-gray-600 mb-0">
                                        We may terminate or suspend your account immediately, without prior notice or liability, for any 
                                        reason whatsoever, including without limitation if you breach the Terms. Upon termination, your 
                                        right to use the Service will immediately cease.
                                    </p>
                                </section>
                                <br />

                                <section id="governing" className="scroll-mt-24">
                                    <h3 className="font-bold text-gray-900 mb-2">10. Governing Law</h3>
                                    <p className="text-sm text-gray-600 mb-0">
                                        These Terms shall be governed and construed in accordance with the laws of Karnataka, India, 
                                        without regard to its conflict of law provisions. Our failure to enforce any right or provision 
                                        of these Terms will not be considered a waiver of those rights.
                                    </p>
                                </section>

                                <section id="contact" className="scroll-mt-24">
                                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 lg:p-10 not-prose mt-12">
                                        <h3 className="text-xl font-bold mb-4 text-gray-900">Legal Contact</h3>
                                        <p className="text-gray-600 mb-6">
                                            For any questions regarding these Terms, please contact our legal team.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-6">
                                            <div>
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</div>
                                                <a href="mailto:legal@vendorflow.com" className="text-indigo-600 hover:text-indigo-700 font-medium">legal@vendorflow.com</a>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Office</div>
                                                <div className="text-gray-900">Bangalore, Karnataka, India</div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
