
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle, Lightbulb, Rocket, Sparkles, Check, Star, TrendingUp, Bot, ShieldCheck, Zap, Store } from 'lucide-react';
import Link from 'next/link';

function Avatar1() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="#635BFF" />
            <path d="M26.5 28C26.5 24.4101 23.5899 21.5 20 21.5C16.4101 21.5 13.5 24.4101 13.5 28" stroke="#E0E7FF" strokeWidth="2" strokeLinecap="round" />
            <circle cx="20" cy="16" r="4" fill="#E0E7FF" />
        </svg>
    )
}

function Avatar2() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="#F472B6" />
            <path d="M26.5 28C26.5 24.4101 23.5899 21.5 20 21.5C16.4101 21.5 13.5 24.4101 13.5 28" stroke="#FCE7F3" strokeWidth="2" strokeLinecap="round" />
            <circle cx="20" cy="16" r="4" fill="#FCE7F3" />
        </svg>
    )
}

function Avatar3() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="#38BDF8" />
            <path d="M26.5 28C26.5 24.4101 23.5899 21.5 20 21.5C16.4101 21.5 13.5 24.4101 13.5 28" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" />
            <circle cx="20" cy="16" r="4" fill="#E0F2FE" />
        </svg>
    )
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-br from-background to-primary/10">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-24 items-center">
              <div className="flex flex-col justify-center space-y-4 animate-fade-in-down">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    Launch Your Next Side Hustle with AI
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground text-base md:text-xl font-medium">
                    HustleSpark is your personal AI-powered launchpad. Stop wondering and start building your next venture today with expert strategy and safe marketplace tools.
                  </p>
                </div>
                <div className="flex flex-col gap-3 min-[400px]:flex-row">
                  <Button asChild size="lg" className="h-14 px-8 rounded-2xl font-black text-lg group shadow-xl">
                    <Link href="/login?tab=signup">
                      Get Started for Free
                      <Rocket className="ml-2 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-2xl font-black text-lg border-2">
                    <Link href="/marketplace">
                      <Store className="mr-2 h-6 w-6" />
                      Browse Marketplace
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative h-[450px] flex items-center justify-center animate-fade-in">
                 <div className="absolute w-80 h-80 bg-accent/30 rounded-full blur-[100px] animate-pulse" />
                 <div className="absolute bottom-0 right-10 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse animation-delay-400" />
                 <div className="relative z-10 w-full max-w-md">
                    <Card className="p-8 bg-background/50 backdrop-blur-xl border-primary/20 shadow-2xl rounded-[2.5rem] transform hover:scale-105 transition-transform">
                      <CardHeader className="p-0 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                           <Bot className="h-5 w-5 text-primary" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Strategy Feed</span>
                        </div>
                        <CardTitle className="text-2xl font-black">AI Strategy Ready</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 space-y-4">
                        <div className="flex items-start gap-3 bg-muted/40 p-4 rounded-2xl">
                           <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                           <p className="text-sm font-medium">Logo & Branding Kit Generated</p>
                        </div>
                        <div className="flex items-start gap-3 bg-muted/40 p-4 rounded-2xl">
                           <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                           <p className="text-sm font-medium">4-Week Launch Roadmap Finalized</p>
                        </div>
                        <div className="flex items-start gap-3 bg-primary/10 p-4 rounded-2xl border border-primary/20">
                           <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                           <p className="text-sm font-black">Escrow Protection Active</p>
                        </div>
                      </CardContent>
                    </Card>
                 </div>
              </div>
            </div>
          </div>
        </section>
        
        <section id="features" className="w-full py-20 lg:py-32">
          <div className="container px-4 md:px-6 animate-fade-in-down">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-full bg-primary/10 text-primary px-4 py-1.5 text-xs font-black uppercase tracking-widest">The Core Stack</div>
                <h2 className="text-3xl font-black tracking-tighter sm:text-5xl">Launch Faster. Earn Sooner.</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl font-medium">
                  HustleSpark provides you with every tool required to transform an interest into a professional, profitable venture.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-16">
              <div className="grid gap-4 text-center p-8 rounded-[2rem] bg-card border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 transform hover:-translate-y-2 group">
                <div className="h-16 w-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Lightbulb className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-black">AI Idea Engine</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Personalized side hustle ideas generated based on your age, skills, and time availability.</p>
              </div>
              <div className="grid gap-4 text-center p-8 rounded-[2rem] bg-card border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 transform hover:-translate-y-2 group">
                 <div className="h-16 w-16 mx-auto bg-accent/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Zap className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-black">Instant Branding</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Instantly generate professional logos, flyers, and high-conversion social media marketing prompts.</p>
              </div>
              <div className="grid gap-4 text-center p-8 rounded-[2rem] bg-card border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 transform hover:-translate-y-2 group">
                 <div className="h-16 w-16 mx-auto bg-green-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                   <ShieldCheck className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-black">Secure Escrow</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Acquire or sell ventures with our industry-standard escrow protection. Payment is only released on delivery.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-20 bg-muted/30">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6 animate-fade-in-down">
                <div className="space-y-3">
                <h2 className="text-3xl font-black tracking-tighter md:text-5xl">
                    Built by Real Hustlers
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground text-lg font-medium">
                    Thousands of creators have launched and exited their ventures using our tools.
                </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                    <Card className="rounded-[2.5rem] shadow-lg border-none bg-background text-left p-2">
                        <CardHeader>
                             <div className="flex items-center mb-4">
                                <Avatar1 />
                                <div className="ml-4">
                                    <p className="font-black">Jane D.</p>
                                    <div className="flex text-yellow-400">
                                       {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current"/>)}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm leading-relaxed italic">"I had a passion for design but no marketing skills. HustleSpark gave me the exact prompts and a killer logo that got me noticed. I landed my first paying client within 48 hours!"</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-[2.5rem] shadow-lg border-none bg-background text-left p-2">
                         <CardHeader>
                            <div className="flex items-center mb-4">
                                <Avatar2 />
                                <div className="ml-4">
                                    <p className="font-black">Mike R.</p>
                                     <div className="flex text-yellow-400">
                                       {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current"/>)}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground text-sm leading-relaxed italic">"The 4-week launch tracker was a game-changer. It broke down everything into simple daily tasks. I sold my first venture on the marketplace for $450 in just 3 weeks."</p>
                        </CardContent>
                    </Card>
                     <Card className="rounded-[2.5rem] shadow-lg border-none bg-background text-left p-2">
                        <CardHeader>
                           <div className="flex items-center mb-4">
                                <Avatar3 />
                                <div className="ml-4">
                                    <p className="font-black">Alex P.</p>
                                    <div className="flex text-yellow-400">
                                       {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current"/>)}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground text-sm leading-relaxed italic">"I went premium for the Live Hustle Coach and it's worth every penny. Sparky kept me motivated and helped me refine my pricing for maximum profit."</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
        
        <section id="premium" className="w-full py-20 lg:py-32">
            <div className="container px-4 md:px-6 animate-fade-in-down">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-xs font-black uppercase tracking-widest">Unlock Your Full Potential</div>
                        <h2 className="text-4xl font-black tracking-tighter sm:text-6xl">Go From Zero to Revenue</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl font-medium">
                            Premium access gives you the complete arsenal to go from initial interest to a successful market exit.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-6xl items-center gap-12 py-16 lg:grid-cols-2">
                    <div className="flex flex-col justify-center space-y-8">
                        <ul className="grid gap-8">
                            <li className="flex gap-4">
                                <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                                   <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black">Strategic Hustle Blueprints</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        Go beyond basic ideas with elite pricing strategies, professional branding origins, and high-impact marketing tactics tailored for your first 5 customers.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                                   <Bot className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black">Sparky: Personal AI Coach</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        Chat with your dedicated AI mentor 24/7. Get real-time advice, expert copywriting help, and actionable growth feedback on your specific venture.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                                   <TrendingUp className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black">4-Week Launch Roadmap</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        Don't guess what's next. Follow an interactive day-by-day roadmap that guides you from setup to launch, with live progress tracking and goals.
                                    </p>
                                </div>
                            </li>
                             <li className="flex gap-4">
                                <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                                   <ShieldCheck className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black">Escrow-Protected Exit</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        Ready to move on? List your venture for sale. We handle secure escrow payments and asset transfers so you get paid safely and instantly.
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                     <div className="flex flex-col items-center">
                        <Card className="w-full max-w-sm border-primary/20 border-2 shadow-2xl shadow-primary/20 transform hover:scale-105 transition-all duration-500 rounded-[3rem] overflow-hidden">
                            <CardHeader className="text-center bg-primary/5 py-12">
                                <CardTitle className="text-2xl font-black mb-2">Growth Access</CardTitle>
                                <div className="flex items-center justify-center gap-1">
                                   <span className="text-5xl font-black">$15</span>
                                   <span className="text-lg font-bold text-muted-foreground">/mo</span>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-8 px-8 text-center">
                                <p className="text-sm font-medium text-muted-foreground leading-relaxed">Join thousands of entrepreneurs building the future. Your small investment today is the seed for your next big paycheck.</p>
                            </CardContent>
                            <CardFooter className="p-8">
                                <Button asChild className="w-full h-14 rounded-2xl font-black text-xl shadow-xl group">
                                    <Link href="/login?tab=signup">
                                        Unlock Premium
                                        <Rocket className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                        <div className="mt-8 flex items-center gap-2 text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em]">
                           <ShieldCheck className="h-4 w-4" /> SSL SECURE CHECKOUT
                        </div>
                     </div>
                </div>
            </div>
        </section>
        
        <section className="w-full py-20 border-t">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6 animate-fade-in-down">
            <div className="space-y-4">
              <h2 className="text-4xl font-black tracking-tighter md:text-6xl">
                Ready to Spark Your Future?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground text-lg font-medium">
                Stop dreaming and start doing. Access the AI engine that turns interests into high-margin ventures.
              </p>
            </div>
            <div className="mx-auto w-full max-w-md space-y-4 mt-8">
               <Button asChild size="lg" className="w-full h-16 rounded-2xl font-black text-2xl shadow-2xl group">
                <Link href="/login?tab=signup">
                  Sign Up Now
                  <Sparkles className="ml-2 h-6 w-6 transition-all duration-300 group-hover:scale-110" />
                </Link>
              </Button>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground font-bold uppercase tracking-widest">
                 <span className="flex items-center gap-1"><Check className="h-4 w-4 text-green-500" /> Free Tier Available</span>
                 <span className="flex items-center gap-1"><Check className="h-4 w-4 text-green-500" /> No CC Required</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t bg-card/50 backdrop-blur-xl">
        <div className="container px-4 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
                <div className="col-span-2 space-y-6">
                    <Link href="/" className="flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" />
                        <span className="text-xl font-black tracking-tighter">HustleSpark</span>
                    </Link>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                        Empowering creators to launch, track, and sell their ventures using state-of-the-art AI coaching and secure marketplace tools.
                    </p>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit text-[10px] font-black text-primary uppercase tracking-widest">
                        <ShieldCheck className="h-3 w-3" />
                        Escrow Protected Platform
                    </div>
                </div>
                
                <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-primary">Platform</h4>
                    <nav className="flex flex-col gap-2">
                        <Link href="/marketplace" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Marketplace</Link>
                        <Link href="/login?tab=signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Start Building</Link>
                        <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Dashboard</Link>
                    </nav>
                </div>

                <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-primary">Legal</h4>
                    <nav className="flex flex-col gap-2">
                        <Link href="/legal/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Privacy Policy</Link>
                        <Link href="/legal/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Terms of Service</Link>
                        <Link href="/legal/refunds" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Refund Policy</Link>
                        <Link href="/legal/acceptable-use" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Acceptable Use</Link>
                    </nav>
                </div>

                <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-primary">Governance</h4>
                    <nav className="flex flex-col gap-2">
                        <Link href="/legal/marketplace" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Marketplace Policy</Link>
                        <Link href="/legal/earnings" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Earnings Disclaimer</Link>
                        <Link href="/legal/intellectual-property" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">IP Policy</Link>
                        <Link href="/legal/dmca" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">DMCA Notice</Link>
                    </nav>
                </div>
            </div>

            <div className="pt-8 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-xs text-muted-foreground font-bold">&copy; 2025 HustleSpark. Built with ❤️ by real hustlers.</p>
                <p className="text-[10px] text-muted-foreground/40 max-w-lg text-center md:text-right font-medium leading-relaxed italic">
                    Testimonials represent potential results. Success requires dedicated effort. Every purchase on our marketplace is escrow-protected for buyer security.
                </p>
            </div>
        </div>
      </footer>
    </div>
  );
}
