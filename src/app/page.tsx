import { Button } from '@/components/ui/button';
import { CheckCircle, Rocket, Sparkles, Check, Star, TrendingUp, Bot, ShieldCheck, Zap, Store, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { HustleCity } from '@/components/hustle-city';
import { HandScrubber } from '@/components/hand-scrubber';
import { TiltCard } from '@/components/tilt-card';
import { CinematicScroll } from '@/components/cinematic-scroll';
import { Meteors } from '@/components/ui/meteors';
import { TypingAnimation } from '@/components/ui/typing-animation';
import { HyperText } from '@/components/ui/hyper-text';
import { WarpBackground } from '@/components/ui/warp-background';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';
import { cn } from '@/lib/utils';


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <CinematicScroll />
      <main className="flex-1">

        {/* HERO */}
        <section className="relative min-h-screen flex items-center overflow-hidden bg-[#030308]">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030308]/20 to-[#030308] z-[2]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030308]/80 via-transparent to-transparent z-[2]" />
          <Meteors number={40} className="z-[5]" />

          <div className="container px-4 md:px-6 relative z-10 py-40 text-center mx-auto">
            <div className="animate-fade-up mb-8 flex justify-center">
              <div className={cn("group rounded-full border border-primary/20 bg-primary/8 text-white transition-all ease-in hover:cursor-pointer hover:bg-primary/15")}>
                <AnimatedShinyText className="inline-flex items-center justify-center px-6 py-2 text-xs font-black uppercase tracking-widest text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse mr-2" />
                  AI-Powered Entrepreneurship
                  <ArrowRight className="ml-2 h-3 w-3" />
                </AnimatedShinyText>
              </div>
            </div>

            <div className="animate-fade-up animation-delay-100 mb-6">
              <h1 className="heading-display text-6xl md:text-7xl lg:text-8xl text-white mb-4">
                Turn Your Obsession Into
              </h1>
              <HyperText className="heading-display text-6xl md:text-7xl lg:text-8xl text-gradient-animated" startOnView={false}>
                Your Empire.
              </HyperText>
            </div>

            <div className="animate-fade-up animation-delay-200 mb-6">
              <TypingAnimation
                className="text-lg md:text-xl text-white/45 max-w-[520px] mx-auto leading-relaxed"
                duration={30}
              >
                HustleSpark uses AI to generate your business idea, build your brand, and get you selling — in minutes.
              </TypingAnimation>
            </div>

            <div className="flex flex-col gap-3 min-[400px]:flex-row justify-center animate-fade-up animation-delay-300 mt-10">
              <Button asChild size="lg" className="h-14 px-8 rounded-2xl font-black text-lg shadow-xl btn-magnetic">
                <Link href="/login?tab=signup">
                  Launch Your Hustle
                  <Rocket className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-2xl font-black text-lg border border-white/15 bg-white/5 text-white hover:bg-white/10 btn-magnetic">
                <Link href="/marketplace">
                  <Store className="mr-2 h-5 w-5" />
                  Browse Marketplace
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 mt-8 animate-fade-up animation-delay-400">
              {['Free to start', 'No credit card', 'Escrow protected'].map(t => (
                <div key={t} className="flex items-center gap-1.5 text-xs font-bold text-white/30">
                  <CheckCircle className="h-3.5 w-3.5 text-primary" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="scroll-cinematic">
            <div className="scroll-line-cinematic" />
            <div className="scroll-txt-cinematic">Scroll</div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="marquee-cinematic">
          <div className="marquee-track-cinematic">
            {['Ship It', 'Get Paid', 'Level Up', 'Build Your Empire', 'AI Powered', 'Zero to Revenue', 'Ship It', 'Get Paid', 'Level Up', 'Build Your Empire', 'AI Powered', 'Zero to Revenue'].map((item, i) => (
              <span key={i} className="marquee-item-cinematic">{item} <span>✦</span></span>
            ))}
          </div>
        </div>

        {/* STATS */}
        <div className="stats-cinematic">
          {[
            { num: '90%', label: 'Payout to sellers', color: 'text-primary' },
            { num: '16wk', label: 'Launch roadmap', color: 'text-accent' },
            { num: '3s', label: 'To generate your hustle', color: 'text-primary' },
            { num: '$0', label: 'To get started', color: 'text-accent' },
          ].map(s => (
            <div key={s.label} className="stat-cinematic cin-reveal">
              <div className={`stat-num-cinematic ${s.color}`}>{s.num}</div>
              <div className="stat-label-cinematic">{s.label}</div>
            </div>
          ))}
        </div>

        {/* FEATURES — WARP BACKGROUND */}
        <section className="w-full py-24 relative overflow-hidden">
          <AnimatedGridPattern
            numSquares={40}
            maxOpacity={0.06}
            duration={4}
            className={cn("absolute inset-0", "[mask-image:radial-gradient(ellipse_at_center,white,transparent)]")}
          />
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-16 cin-reveal">
              <span className="text-xs font-black uppercase tracking-widest text-primary block mb-4">The Platform</span>
              <h2 className="heading-display text-5xl md:text-6xl text-white">Everything you need<br/>to launch and get paid.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <TiltCard className="md:col-span-2 rounded-[2rem] bg-white/[0.03] border border-white/[0.07] p-8 cin-reveal relative overflow-hidden">
                <Meteors number={8} />
                <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center mb-5">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">AI Hustle Generator</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-6">Enter your interests and skills. Our AI generates 3 personalized business ideas tailored exactly to you in seconds.</p>
                <div className="text-5xl font-black text-primary tracking-tighter">3s</div>
                <div className="text-xs text-white/25 mt-1">Average generation time</div>
              </TiltCard>

              <TiltCard className="rounded-[2rem] bg-white/[0.03] border border-white/[0.07] p-8 cin-reveal cin-reveal-delay-1">
                <div className="h-10 w-10 rounded-xl bg-accent/15 flex items-center justify-center mb-5">
                  <Star className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Hustle Score</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-6">Track your 0-1000 reputation score. Climb from Starter to Elite.</p>
                <div className="space-y-2">
                  {[['Elite 💎', 95], ['Pro 🥇', 68], ['Rising 🥈', 42], ['Starter 🥉', 20]].map(([label, w]) => (
                    <div key={label as string}>
                      <div className="text-xs text-white/30 mb-1">{label}</div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: w + '%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </TiltCard>

              <TiltCard className="rounded-[2rem] bg-white/[0.03] border border-white/[0.07] p-8 cin-reveal">
                <div className="h-10 w-10 rounded-xl bg-green-500/15 flex items-center justify-center mb-5">
                  <ShieldCheck className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Escrow Protected</h3>
                <p className="text-white/40 text-sm leading-relaxed">Every transaction held safely. Payment releases only after you confirm delivery.</p>
              </TiltCard>

              <TiltCard className="rounded-[2rem] bg-white/[0.03] border border-white/[0.07] p-8 cin-reveal cin-reveal-delay-1">
                <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center mb-5">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Sparky AI Coach</h3>
                <p className="text-white/40 text-sm leading-relaxed">Your personal AI mentor available 24/7 for real advice and growth feedback.</p>
              </TiltCard>

              <TiltCard className="rounded-[2rem] bg-white/[0.03] border border-white/[0.07] p-8 cin-reveal cin-reveal-delay-2">
                <div className="h-10 w-10 rounded-xl bg-accent/15 flex items-center justify-center mb-5">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">16-Week Roadmap</h3>
                <p className="text-white/40 text-sm leading-relaxed">Day-by-day launch plan from setup to first sale, with live progress tracking.</p>
              </TiltCard>
            </div>
          </div>
        </section>

        {/* HAND SCRUBBER */}
        <HandScrubber />

        {/* HUSTLE CITY */}
        <section className="relative min-h-[80vh] flex items-end overflow-hidden bg-[#030308]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#030308]/50 to-[#030308] z-[2]" />
          <div className="container px-4 md:px-6 relative z-10 pb-16 w-full">
            <div className="cin-reveal mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-primary">Hustle City</span>
            </div>
            <div className="cin-reveal cin-reveal-delay-1 mb-6">
              <h2 className="heading-display text-5xl md:text-6xl lg:text-7xl text-white">
                Seven worlds.<br/>
                <span className="text-gradient-animated">Pick your building.</span>
              </h2>
            </div>
            <div className="cin-reveal cin-reveal-delay-2 mb-12">
              <p className="text-white/40 text-lg max-w-md">Every glowing tower is a different way to make money. Click one to step inside.</p>
            </div>
            <div className="cin-reveal cin-reveal-delay-3">
              <HustleCity />
            </div>
          </div>
        </section>

        {/* CTA — WARP */}
        <WarpBackground className="min-h-[80vh] flex items-center justify-center">
          <div className="relative z-10 text-center max-w-[560px] mx-auto px-6">
            <h2 className="heading-display text-5xl md:text-6xl text-white mb-6 cin-reveal">
              Your first paycheck<br/>
              starts <span className="text-gradient-animated">here.</span>
            </h2>
            <p className="text-white/40 text-lg mb-10 leading-relaxed cin-reveal cin-reveal-delay-1">
              Join thousands of entrepreneurs building the future. Free to start, no credit card needed.
            </p>
            <div className="cin-reveal cin-reveal-delay-2">
              <Button asChild size="lg" className="h-16 px-12 rounded-2xl font-black text-xl shadow-2xl btn-magnetic">
                <Link href="/login?tab=signup">
                  Launch Your Hustle
                  <Sparkles className="ml-2 h-6 w-6" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-4 mt-6 text-xs text-white/25 font-bold uppercase tracking-widest cin-reveal cin-reveal-delay-3">
              <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-primary" /> Free Tier</span>
              <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-primary" /> No CC Required</span>
              <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-primary" /> Instant Access</span>
            </div>
          </div>
        </WarpBackground>

      </main>

      <footer className="border-t border-white/[0.06] bg-black/20 backdrop-blur-xl">
        <div className="container px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2 space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-xl font-black tracking-tighter text-white">HustleSpark</span>
              </Link>
              <p className="text-sm text-white/30 leading-relaxed max-w-xs">Empowering the next generation of entrepreneurs with AI-powered tools and a secure marketplace.</p>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit text-[10px] font-black text-primary uppercase tracking-widest">
                <ShieldCheck className="h-3 w-3" /> Escrow Protected Platform
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-primary">Platform</h4>
              <nav className="flex flex-col gap-2">
                <Link href="/marketplace" className="text-sm text-white/30 hover:text-white transition-colors">Marketplace</Link>
                <Link href="/login?tab=signup" className="text-sm text-white/30 hover:text-white transition-colors">Start Building</Link>
                <Link href="/profile" className="text-sm text-white/30 hover:text-white transition-colors">Dashboard</Link>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-primary">Legal</h4>
              <nav className="flex flex-col gap-2">
                <Link href="/legal/privacy" className="text-sm text-white/30 hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/legal/terms" className="text-sm text-white/30 hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/legal/privacy-nutrition-label" className="text-sm text-white/30 hover:text-white transition-colors">Privacy Label</Link>
                <Link href="/legal/accessibility" className="text-sm text-white/30 hover:text-white transition-colors">Accessibility</Link>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-primary">Governance</h4>
              <nav className="flex flex-col gap-2">
                <Link href="/legal/marketplace" className="text-sm text-white/30 hover:text-white transition-colors">Marketplace Policy</Link>
                <Link href="/legal/dmca" className="text-sm text-white/30 hover:text-white transition-colors">DMCA Notice</Link>
                <Link href="/legal/earnings" className="text-sm text-white/30 hover:text-white transition-colors">Earnings Disclaimer</Link>
              </nav>
            </div>
          </div>
          <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/20 font-bold">&copy; 2026 HustleSpark. All Rights Reserved.</p>
            <p className="text-[10px] text-white/15 max-w-lg text-center md:text-right">AI Disclosure: HustleSpark uses artificial intelligence to generate hustle ideas and marketing copy. All AI-generated content should be reviewed before use.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
