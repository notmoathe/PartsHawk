import Link from 'next/link'

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
            {/* Header / Nav */}
            <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-2">
                        ← Return to Trace Motorsports
                    </Link>
                    <span className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Legal Doc 001</span>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
                {/* Title Section */}
                <div className="mb-16 space-y-4">
                    <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-white">
                        Terms of <span className="text-red-600">Service</span>
                    </h1>
                    <p className="text-zinc-400 text-lg border-l-2 border-red-600 pl-4">
                        Please read these terms carefully before using our services.
                    </p>
                    <p className="text-zinc-500 text-sm font-mono">Last Updated: January 26, 2026</p>
                </div>

                {/* Content */}
                <div className="space-y-12 text-zinc-300 leading-relaxed font-light">

                    {/* Section 1 */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                            <span className="text-red-600">01.</span> Acceptance of Terms
                        </h2>
                        <p>
                            By accessing and using Trace Motorsports ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                        </p>
                        <p className="bg-zinc-900 p-4 border border-zinc-800 rounded-lg text-sm text-zinc-400">
                            If you do not agree to these terms, please do not use the Service. We reserve the right to modify these terms at any time without prior notice.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                            <span className="text-red-600">02.</span> Service Description
                        </h2>
                        <p>
                            Trace Motorsports provides automated monitoring services for third-party marketplaces (including but not limited to eBay and Facebook Marketplace). We act as a data aggregation tool.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                            <li>We are <strong>not</strong> affiliated, associated, authorized, endorsed by, or in any way officially connected with eBay, Meta, or any of their subsidiaries or its affiliates.</li>
                            <li>We do not sell parts directly. We provide links to third-party listings.</li>
                            <li>We cannot guarantee the availability, price, or condition of any item found through our service.</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                            <span className="text-red-600">03.</span> User Conduct & Restrictions
                        </h2>
                        <p>
                            You agree to use the Service only for lawful purposes. You are prohibited from:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="bg-zinc-900/50 p-4 border border-zinc-800 rounded">
                                <strong className="text-white block mb-1">Automated Scraping</strong>
                                Using bots, spiders, or scrapers to access our internal API or dashboard is strictly prohibited.
                            </div>
                            <div className="bg-zinc-900/50 p-4 border border-zinc-800 rounded">
                                <strong className="text-white block mb-1">Account Sharing</strong>
                                Sharing your login credentials with multiple users to bypass subscription limits is grounds for immediate termination.
                            </div>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                            <span className="text-red-600">04.</span> Membership, Billing & Cancellation
                        </h2>
                        <p>
                            <strong>Billing:</strong> Membership fees are billed on a recurring monthly or annual basis depending on your selected plan.
                        </p>
                        <p>
                            <strong>Cancellation:</strong> You may cancel your subscription at any time via your account dashboard. Your access will continue until the end of your current billing period.
                        </p>
                        <p>
                            <strong>Refunds:</strong> We offer a 3-day money-back guarantee for new users if the service does not meet expectations. After this period, refunds are processed at our sole discretion.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                            <span className="text-red-600">05.</span> Limitation of Liability
                        </h2>
                        <p className="uppercase text-xs font-bold text-zinc-500 tracking-widest">Read this carefully</p>
                        <p>
                            Trace Motorsports is provided on an "AS IS" and "AS AVAILABLE" basis. We are not responsible for:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                            <li>Missed deals or delayed alerts due to third-party platform downtime.</li>
                            <li>Financial losses incurred from purchasing items found through our links.</li>
                            <li>Scams or fraudulent listings posted by third-party sellers. Always do your own due diligence before purchasing.</li>
                        </ul>
                    </section>

                    {/* Section 6 */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                            <span className="text-red-600">06.</span> Intellectual Property
                        </h2>
                        <p>
                            The content, organization, graphics, design, and other matters related to the Site are protected under applicable copyrights and other proprietary laws. The copying, redistribution, use, or publication by you of any such matters or any part of the Site is strictly prohibited.
                        </p>
                    </section>

                    {/* Footer / Contact */}
                    <div className="mt-16 pt-8 border-t border-zinc-800">
                        <p className="text-zinc-500 text-sm">
                            Questions about the Terms of Service? Contact us at <a href="mailto:legal@tracemotorsports.com" className="text-white underline hover:text-red-500">legal@tracemotorsports.com</a>.
                        </p>
                    </div>

                </div>
            </div>
        </main>
    )
}