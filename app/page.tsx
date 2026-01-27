import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter">
            Part<span className="text-blue-500">Hawk</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-800">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Now monitoring eBay & Facebook Marketplace
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Never Miss a Deal on Car Parts Again
          </h1>

          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            PartHawk monitors eBay and Facebook Marketplace 24/7, instantly alerting you when parts matching your criteria appear at your price point.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-105">
                Start Monitoring Free
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white px-8 py-6 text-lg rounded-xl">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-zinc-800/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-zinc-500">Monitoring</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">&lt;1min</div>
              <div className="text-zinc-500">Alert Speed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">2+</div>
              <div className="text-zinc-500">Marketplaces</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">∞</div>
              <div className="text-zinc-500">Hawks Per User</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How PartHawk Works</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Set up your monitoring criteria once, and we'll handle the rest.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl mb-4">
                  🎯
                </div>
                <CardTitle className="text-white text-xl">1. Create a Hawk</CardTitle>
                <CardDescription className="text-zinc-400">
                  Enter keywords like "G35 Coupe Headlight", set your max price, and choose which platforms to monitor.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-2xl mb-4">
                  🔍
                </div>
                <CardTitle className="text-white text-xl">2. We Scan Constantly</CardTitle>
                <CardDescription className="text-zinc-400">
                  Our system checks eBay and Facebook Marketplace every few minutes for new listings matching your criteria.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-2xl mb-4">
                  🔔
                </div>
                <CardTitle className="text-white text-xl">3. Get Instant Alerts</CardTitle>
                <CardDescription className="text-zinc-400">
                  The moment a matching part appears, you get notified via SMS or email. Be the first to grab the deal.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-blue-800 p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Stop Refreshing. Start Finding.
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Join car enthusiasts who use PartHawk to snipe the best deals before anyone else.
              </p>
              <Link href="/login">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-zinc-100 font-semibold px-10 py-6 text-lg rounded-xl shadow-lg transition-all hover:scale-105">
                  Create Your First Hawk
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-800/50">
        <div className="container mx-auto text-center text-zinc-500">
          <p>© 2024 PartHawk. Built for car enthusiasts.</p>
        </div>
      </footer>
    </main>
  )
}
