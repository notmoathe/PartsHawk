import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-black text-white p-6 md:p-12">
            <div className="max-w-xl mx-auto space-y-8">
                <Link href="/" className="text-zinc-500 hover:text-white transition-colors">← Back to Home</Link>

                <div className="mb-8">
                    <h1 className="text-4xl font-black uppercase italic text-red-600 mb-4">Contact Support</h1>
                    <p className="text-zinc-400">Need help with your account or have a feature request? Reach out to our team.</p>
                </div>

                <form className="space-y-6 bg-zinc-950 p-8 border border-zinc-900">
                    <div className="space-y-2">
                        <Label className="text-zinc-300 uppercase font-bold text-xs tracking-wider">Name</Label>
                        <Input className="bg-black border-zinc-800 h-11" placeholder="Your Name" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300 uppercase font-bold text-xs tracking-wider">Email</Label>
                        <Input className="bg-black border-zinc-800 h-11" type="email" placeholder="you@example.com" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300 uppercase font-bold text-xs tracking-wider">Message</Label>
                        <textarea
                            className="w-full bg-black border border-zinc-800 rounded-md p-3 text-white placeholder:text-zinc-700 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-red-600"
                            placeholder="How can we help?"
                        ></textarea>
                    </div>

                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest h-12 rounded-none">
                        Send Message
                    </Button>
                </form>

                <div className="text-center text-zinc-500 text-sm">
                    <p>Or email us directly at <a href="mailto:support@tracemotorsports.com" className="text-red-500 hover:underline">support@tracemotorsports.com</a></p>
                </div>
            </div>
        </main>
    )
}
