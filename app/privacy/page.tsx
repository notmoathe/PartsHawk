import Link from 'next/link'

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-black text-white p-6 md:p-12">
            <div className="max-w-3xl mx-auto space-y-8">
                <Link href="/" className="text-zinc-500 hover:text-white transition-colors">← Back to Home</Link>

                <h1 className="text-4xl font-black uppercase italic text-red-600">Privacy Policy</h1>
                <p className="text-zinc-400">Last Updated: January 26, 2026</p>

                <div className="space-y-6 text-zinc-300 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 uppercase">1. Information We Collect</h2>
                        <p>We collect email addresses for account management and alert delivery. We may collect phone numbers if you opt-in for SMS alerts.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 uppercase">2. How We Use Your Data</h2>
                        <p>Your data is used solely to provide the monitoring service, process payments, and send you the alerts you have configured.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 uppercase">3. Data Security</h2>
                        <p>We implement security measures to maintain the safety of your personal information. Database credentials and passwords are encrypted.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 uppercase">4. Third-Party Services</h2>
                        <p>We use Supabase for authentication and database services. We do not sell your data to third-party advertisers.</p>
                    </section>
                </div>
            </div>
        </main>
    )
}
