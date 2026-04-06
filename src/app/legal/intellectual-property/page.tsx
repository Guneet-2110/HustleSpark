import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Zap } from 'lucide-react';

export default function IntellectualPropertyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 md:py-20">
            <div className="container max-w-4xl px-4">
                <div className="mb-8 flex items-center justify-between">
                    <Link href="/" className="group flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
                        <ShieldCheck className="h-3 w-3" />
                        IP Registry Secured
                    </div>
                </div>

                <div className="bg-card/50 backdrop-blur-xl border border-primary/10 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <div className="bg-primary/5 p-8 md:p-12 border-b border-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <Zap className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Intellectual Property</h1>
                        </div>
                        <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px]">Last Updated: April 6, 2026</p>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="prose prose-invert prose-sm max-w-none space-y-10">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">01</span>
                                    Platform Intellectual Property
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">All content on HustleSpark including software, algorithms, AI systems, branding, logos, user interface elements, written content, and design is the exclusive property of Guneet Arora / HustleSpark or its licensors.</p>
                                <p className="text-muted-foreground leading-relaxed text-base font-bold text-foreground/80">Users may not:</p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 text-base">
                                    <li>Reproduce or distribute platform content without written permission</li>
                                    <li>Reverse engineer platform algorithms or AI systems</li>
                                    <li>Create competing services based on HustleSpark systems</li>
                                    <li>Use HustleSpark branding or trademarks without permission</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">02</span>
                                    User-Generated Content
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">When submitting content to the Platform, users represent that they own or have the legal right to use and sell that content, and that it does not infringe on third-party intellectual property rights. HustleSpark is not responsible for user-submitted content that infringes third-party rights.</p>
                            </section>

                            <div className="border-t border-primary/10 pt-8 mt-8">
                                <p className="text-sm text-muted-foreground font-medium">Contact: <a href="mailto:guneet.ar2010@gmail.com" className="text-primary hover:underline font-bold">guneet.ar2010@gmail.com</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}