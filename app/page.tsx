import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Check } from 'lucide-react'

import { createClient } from '@/lib/supabase-server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen bg-black text-white selection:bg-red-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter uppercase italic">
            Trace<span className="text-red-600">Motorsports</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href={user ? "/dashboard" : "/login"}>
              <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5">
                {user ? "Dashboard" : "Log In"}
              </Button>
            </Link>
            <Link href={user ? "/dashboard" : "/login"}>
              <Button className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wide skew-x-[-10deg]">
                <span className="skew-x-[10deg]">{user ? "Open Command Center" : "Get Access"}</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-red-600/20 blur-[120px] rounded-full pointer-events-none opacity-50"></div>

        <div className="container mx-auto text-center max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/30 border border-red-900/50 text-red-400 text-xs font-bold uppercase tracking-wider mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            Live Market Intelligence
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 uppercase italic leading-[0.9]">
            Hunt Down <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">Rare Parts</span>
          </h1>

          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            The elite tool for JDM locators and resellers. We scan eBay and Facebook Marketplace specifically for the parts others miss.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/login">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold px-10 py-8 text-xl rounded-none skew-x-[-10deg] shadow-[0_0_30px_-5px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_-10px_rgba(220,38,38,0.6)] transition-all">
                <span className="skew-x-[10deg]">Start Hunting Free</span>
              </Button>
            </Link>
            <Link href="#pricing">
              <Button size="lg" variant="outline" className="border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-red-600/50 hover:text-white px-10 py-8 text-xl rounded-none skew-x-[-10deg]">
                <span className="skew-x-[10deg]">View Memberships</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
            <div>
              <div className="text-5xl font-black text-white italic mb-1">0.5s</div>
              <div className="text-red-500 font-bold uppercase text-sm tracking-wider">Latency</div>
            </div>
            <div>
              <div className="text-5xl font-black text-white italic mb-1">24/7</div>
              <div className="text-red-500 font-bold uppercase text-sm tracking-wider">Surveillance</div>
            </div>
            <div>
              <div className="text-5xl font-black text-white italic mb-1">100%</div>
              <div className="text-red-500 font-bold uppercase text-sm tracking-wider">Coverage</div>
            </div>
            <div>
              <div className="text-5xl font-black text-white italic mb-1">PRO</div>
              <div className="text-red-500 font-bold uppercase text-sm tracking-wider">Tools</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 relative">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black uppercase italic mb-4">Choose Your Class</h2>
            <p className="text-zinc-400 text-lg">
              Unlock faster scanning speeds and exclusive marketplaces.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Tier */}
            <Card className="bg-zinc-950 border-zinc-800 relative overflow-hidden group hover:border-zinc-700 transition-colors">
              <CardHeader className="pt-10">
                <CardTitle className="text-zinc-500 text-xl font-bold uppercase tracking-widest">Street Class</CardTitle>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-black text-white">$0</span>
                  <span className="text-zinc-500 ml-2">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 text-zinc-400 text-sm">
                  <li className="flex items-center gap-3"><Check className="text-zinc-500 h-4 w-4" /> 1 Active Monitor</li>
                  <li className="flex items-center gap-3"><Check className="text-zinc-500 h-4 w-4" /> 15-Minute Scan Interval</li>
                  <li className="flex items-center gap-3"><Check className="text-zinc-500 h-4 w-4" /> eBay Only</li>
                  <li className="flex items-center gap-3"><Check className="text-zinc-500 h-4 w-4" /> Email Alerts</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/login" className="w-full">
                  <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold h-12 uppercase tracking-wide">
                    Start Free
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Pro Tier (Featured) */}
            <Card className="bg-zinc-950 border-red-600 relative overflow-hidden group shadow-[0_0_50px_-20px_rgba(220,38,38,0.3)] scale-105 z-10">
              <div className="absolute top-0 inset-x-0 h-1 bg-red-600"></div>
              <CardHeader className="pt-10">
                <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-sm">Most Popular</div>
                <CardTitle className="text-red-500 text-xl font-black uppercase tracking-widest italic">Club Spec</CardTitle>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-black text-white">$29</span>
                  <span className="text-zinc-500 ml-2">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="absolute inset-0 bg-red-600/5 pointer-events-none"></div>
                <ul className="space-y-4 text-zinc-300 text-sm font-medium relative z-10">
                  <li className="flex items-center gap-3"><Check className="text-red-500 h-5 w-5" /> 10 Active Monitors</li>
                  <li className="flex items-center gap-3"><Check className="text-red-500 h-5 w-5" /> <strong>5-Minute</strong> Scan Interval</li>
                  <li className="flex items-center gap-3"><Check className="text-red-500 h-5 w-5" /> eBay & <strong>Facebook Marketplace</strong></li>
                  <li className="flex items-center gap-3"><Check className="text-red-500 h-5 w-5" /> SMS & Email Alerts</li>
                  <li className="flex items-center gap-3"><Check className="text-red-500 h-5 w-5" /> Early Access Features</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/login" className="w-full">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-black h-12 uppercase tracking-wide shadow-lg">
                    Go Club Spec
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Enterprise Tier */}
            <Card className="bg-zinc-950 border-zinc-800 relative overflow-hidden group hover:border-zinc-700 transition-colors">
              <CardHeader className="pt-10">
                <CardTitle className="text-white text-xl font-black uppercase tracking-widest italic">Race Team</CardTitle>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-black text-white">$99</span>
                  <span className="text-zinc-500 ml-2">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 text-zinc-400 text-sm">
                  <li className="flex items-center gap-3"><Check className="text-white h-4 w-4" /> Unlimited Monitors</li>
                  <li className="flex items-center gap-3"><Check className="text-white h-4 w-4" /> <strong>Instant</strong> Scan Interval</li>
                  <li className="flex items-center gap-3"><Check className="text-white h-4 w-4" /> All Platforms + Forums</li>
                  <li className="flex items-center gap-3"><Check className="text-white h-4 w-4" /> Webhook Integration</li>
                  <li className="flex items-center gap-3"><Check className="text-white h-4 w-4" /> Priority Support</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/login" className="w-full">
                  <Button className="w-full bg-white hover:bg-zinc-200 text-black font-bold h-12 uppercase tracking-wide">
                    Contact Sales
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="container mx-auto flex flex-col items-center justify-center">
          <p className="text-2xl font-black tracking-tighter uppercase italic mb-4">
            Trace<span className="text-red-600">Motorsports</span>
          </p>
          <div className="text-zinc-600 text-sm flex gap-6">
            <Link href="/terms" className="hover:text-red-500 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-red-500 transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-red-500 transition-colors">Contact</Link>
          </div>
          <p className="text-zinc-700 text-xs mt-8">© 2026 Trace Motorsports. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
