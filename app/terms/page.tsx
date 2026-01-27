import Link from 'next/link'

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-black text-white p-6 md:p-12">
            <div className="max-w-3xl mx-auto space-y-8">
                <Link href="/" className="text-zinc-500 hover:text-white transition-colors">← Back to Home</Link>

                <h1 className="text-4xl font-black uppercase italic text-red-600">Terms of Service</h1>
                <p className="text-zinc-400">Last Updated: January 26, 2026</p>

                <div className="space-y-6 text-zinc-300 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 uppercase">1. Acceptance of Terms</h2>
                        <p>By accessing and using Trace Motorsports, you accept and agree to be bound by the terms and provision of this agreement.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 uppercase">2. Service Description</h2>
                        <p>Trace Motorsports provides automated monitoring services for third-party marketplaces (eBay, Facebook Marketplace). We are not affiliated with these platforms.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 uppercase">3. User Conduct</h2>
                        <p>You agree not to use the service for any unlawful purpose or to violate any laws in your jurisdiction. Automated scraping of our service is prohibited.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 uppercase">4. Membership & Billing</h2>
                        <p>Membership fees are billed on a monthly basis. You may cancel at any time. Refunds are processed at our discretion.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 uppercase">5. Limitation of Liability</h2>
                        <p>Trace Motorsports is provided "as is". We are not responsible for missed deals, platform downtime, or financial losses incurred while using our data.</p>
                    </section>
                </div>
            </div>
        </main>
    )
}
