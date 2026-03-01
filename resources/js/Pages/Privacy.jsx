import GuestLayout from '@/Components/GuestLayout';

export default function Privacy() {
    const sections = [
        { id: 'collection', title: 'Information We Collect' },
        { id: 'usage', title: 'How We Use Your Information' },
        { id: 'sharing', title: 'Information Sharing' },
        { id: 'security', title: 'Data Security' },
        { id: 'retention', title: 'Data Retention' },
        { id: 'rights', title: 'Your Rights' },
        { id: 'cookies', title: 'Cookies' },
        { id: 'contact', title: 'Contact Us' },
    ];

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <GuestLayout title="Privacy Policy - VendorFlow">
            <div className="bg-(--color-bg-primary) min-h-screen">
                {/* Header */}
                <div className="bg-(--color-bg-secondary) border-b border-(--color-border-secondary)">
                    <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-(--color-bg-primary) border border-(--color-border-primary) text-(--color-brand-primary) text-xs font-bold uppercase tracking-wide mb-6 shadow-sm">
                                Effective Date: January 15, 2026
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-bold text-(--color-text-primary) mb-6 tracking-tight">
                                Privacy Policy
                            </h1>
                            <p className="text-xl text-(--color-text-tertiary) leading-relaxed">
                                We believe in transparency. This policy outlines how we collect,
                                use, and store your data to ensure your trust and safety.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
                    <div className="grid lg:grid-cols-12 gap-12">
                        {/* Sidebar Navigation */}
                        <div className="hidden lg:block lg:col-span-3">
                            <div className="sticky top-8 space-y-1">
                                <h3 className="text-xs font-bold text-(--color-text-muted) uppercase tracking-wider mb-4 px-3">
                                    Contents
                                </h3>
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className="block w-full text-left px-3 py-2 text-sm font-medium text-(--color-text-tertiary) hover:text-(--color-brand-primary) hover:bg-(--color-bg-hover) rounded-lg transition-colors border-l-2 border-transparent hover:border-(--color-brand-primary-light)"
                                    >
                                        {section.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="lg:col-span-9">
                            <div className="prose prose-lg prose-indigo max-w-none prose-li:my-3 prose-p:leading-loose prose-p:text-(--color-text-tertiary) prose-headings:mb-6 prose-headings:text-(--color-text-primary) prose-li:text-(--color-text-tertiary)">
                                <p className="lead text-(--color-text-tertiary)">
                                    At VendorFlow, we take your privacy seriously. This Privacy
                                    Policy explains how we collect, use, disclose, and safeguard
                                    your information when you use our platform. By using our
                                    services, you agree to the collection and use of information in
                                    accordance with this policy.
                                </p>

                                <hr className="my-12 border-(--color-border-secondary)" />

                                <section id="collection" className="scroll-mt-24">
                                    <h3 className="font-bold text-(--color-text-primary) mb-2">
                                        1. Information We Collect
                                    </h3>
                                    <p className="text-sm text-(--color-text-tertiary) mb-0">
                                        We collect information that you provide directly to us,
                                        specifically:
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-6 not-prose my-8">
                                        {[
                                            {
                                                title: 'Identity Data',
                                                desc: 'Name, username, or similar identifier.',
                                            },
                                            {
                                                title: 'Contact Data',
                                                desc: 'Billing address, delivery address, email address, and telephone numbers.',
                                            },
                                            {
                                                title: 'Financial Data',
                                                desc: 'Bank account and payment card details.',
                                            },
                                            {
                                                title: 'Technical Data',
                                                desc: 'IP address, login data, browser type and version.',
                                            },
                                        ].map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-(--color-bg-secondary) p-6 rounded-xl border border-(--color-border-secondary)"
                                            >
                                                <h4 className="font-bold text-(--color-text-primary) mb-2">
                                                    {item.title}
                                                </h4>
                                                <p className="text-sm text-(--color-text-tertiary) mb-0">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section id="usage" className="scroll-mt-24">
                                    <h3 className="font-bold text-(--color-text-primary) mb-2">
                                        2. How We Use Your Information
                                    </h3>
                                    <p className="text-sm text-(--color-text-tertiary) mb-1">
                                        We use the information we collect to:
                                    </p>
                                    <ul className="space-y-2 text-sm text-(--color-text-tertiary) mb-0">
                                        <li>
                                            Provide, maintain, and improve our services to meet your
                                            needs.
                                        </li>
                                        <li>
                                            Process transactions and strictly send related
                                            information such as confirmations and invoices.
                                        </li>
                                        <li>
                                            Send technical notices, updates, security alerts, and
                                            support and administrative messages.
                                        </li>
                                        <li>
                                            Respond to your comments, questions, and requests, and
                                            provide customer service.
                                        </li>
                                        <li>
                                            Monitor and analyze trends, usage, and activities in
                                            connection with our services.
                                        </li>
                                        <li>
                                            Detect, investigate, and prevent fraudulent transactions
                                            and other illegal activities.
                                        </li>
                                    </ul>
                                </section>
                                <br />
                                <section id="sharing" className="scroll-mt-24">
                                    <h3 className="font-bold text-(--color-text-primary) mb-2">
                                        3. Information Sharing
                                    </h3>
                                    <p className="text-sm text-(--color-text-tertiary) mb-0">
                                        We do not sell, trade, or rent your personal information to
                                        third parties. We may share your information only in the
                                        following circumstances:
                                    </p>
                                    <ul className="space-y-2 text-sm text-(--color-text-tertiary) mb-0">
                                        <li>
                                            <strong>With your consent:</strong> We may share
                                            information when you direct us to do so.
                                        </li>
                                        <li>
                                            <strong>Service Providers:</strong> We share information
                                            with vendors, consultants, and other service providers
                                            who need access to such information to carry out work on
                                            our behalf.
                                        </li>
                                        <li>
                                            <strong>Legal Compliance:</strong> We may disclose
                                            information if we believe disclosure is in accordance
                                            with any applicable law, regulation, or legal process.
                                        </li>
                                        <li>
                                            <strong>Protection of Rights:</strong> To enforce our
                                            agreements, policies, and terms of service, and to
                                            protect the security or integrity of our services.
                                        </li>
                                    </ul>
                                </section>
                                <br />
                                <section id="security" className="scroll-mt-24">
                                    <h3 className="font-bold text-(--color-text-primary) mb-2">
                                        4. Data Security
                                    </h3>
                                    <p className="text-sm text-(--color-text-tertiary) mb-0">
                                        We implement appropriate technical and organizational
                                        security measures to protect your personal information
                                        against unauthorized access, alteration, disclosure, or
                                        destruction. This includes:
                                    </p>
                                    <ul className="space-y-2 text-sm text-(--color-text-tertiary) mb-0">
                                        <li>
                                            Encryption of data in transit (TLS 1.2+) and at rest
                                            (AES-256).
                                        </li>
                                        <li>
                                            Regular security audits and vulnerability assessments.
                                        </li>
                                        <li>
                                            Strict access controls and authentication mechanisms.
                                        </li>
                                        <li>Continuous monitoring for suspicious activities.</li>
                                    </ul>
                                </section>
                                <br />
                                <section id="retention" className="scroll-mt-24">
                                    <h3 className="font-bold text-(--color-text-primary) mb-2">
                                        5. Data Retention
                                    </h3>
                                    <p className="text-sm text-(--color-text-tertiary) mb-0">
                                        We retain your information for as long as your account is
                                        active or as needed to provide you services. We will also
                                        retain and use your information to comply with legal
                                        obligations, resolve disputes, and enforce our agreements.
                                        When we no longer have a legitimate business need to process
                                        your information, we will either delete or anonymize it.
                                    </p>
                                </section>
                                <br />
                                <section id="rights" className="scroll-mt-24">
                                    <h3 className="font-bold text-(--color-text-primary) mb-2">
                                        6. Your Rights
                                    </h3>
                                    <p className="text-sm text-(--color-text-tertiary) mb-0">
                                        Depending on your location, you may have the following
                                        rights regarding your personal data:
                                    </p>
                                    <div className="bg-(--color-brand-primary-light) border-l-4 border-(--color-brand-primary) p-6 my-6 not-prose">
                                        <ul className="list-disc pl-4 space-y-2 text-sm text-(--color-brand-primary-dark)">
                                            <li>
                                                <strong>Access:</strong> The right to request copies
                                                of your personal data.
                                            </li>
                                            <li>
                                                <strong>Rectification:</strong> The right to request
                                                correction of inaccurate information.
                                            </li>
                                            <li>
                                                <strong>Erasure:</strong> The right to request
                                                deletion of your personal data.
                                            </li>
                                            <li>
                                                <strong>Restriction:</strong> The right to request
                                                restriction of processing.
                                            </li>
                                            <li>
                                                <strong>Data Portability:</strong> The right to
                                                request transfer of data to another organization.
                                            </li>
                                        </ul>
                                    </div>
                                </section>

                                <section id="cookies" className="scroll-mt-24">
                                    <h3 className="font-bold text-(--color-text-primary) mb-2">
                                        7. Cookies and Tracking
                                    </h3>
                                    <p className="text-sm text-(--color-text-tertiary) mb-0">
                                        We use cookies and similar tracking technologies to track
                                        activity on our platform and hold certain information. You
                                        can instruct your browser to refuse all cookies or to
                                        indicate when a cookie is being sent. However, if you do not
                                        accept cookies, you may not be able to use some portions of
                                        our service.
                                    </p>
                                </section>

                                <section id="contact" className="scroll-mt-24">
                                    <div className="bg-(--color-bg-secondary) border border-(--color-border-primary) rounded-2xl p-8 lg:p-10 not-prose mt-12">
                                        <h3 className="text-xl font-bold mb-4 text-(--color-text-primary)">
                                            Contact Us
                                        </h3>
                                        <p className="text-(--color-text-tertiary) mb-6">
                                            If you have any questions about this Privacy Policy,
                                            please contact us. We are committed to working with you
                                            to obtain a fair resolution of any complaint or concern
                                            about privacy.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-6">
                                            <div>
                                                <div className="text-xs font-bold text-(--color-text-muted) uppercase tracking-wider mb-1">
                                                    Email
                                                </div>
                                                <a
                                                    href="mailto:privacy@vendorflow.com"
                                                    className="text-(--color-brand-primary) hover:text-(--color-brand-primary-hover) font-medium"
                                                >
                                                    privacy@vendorflow.com
                                                </a>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-(--color-text-muted) uppercase tracking-wider mb-1">
                                                    Address
                                                </div>
                                                <div className="text-(--color-text-primary)">
                                                    Bangalore, Karnataka, India
                                                </div>
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
