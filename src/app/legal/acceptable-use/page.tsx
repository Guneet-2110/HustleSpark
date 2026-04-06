import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Scale } from 'lucide-react';

export default function AcceptableUsePage() {
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
                        Compliance Protocol
                    </div>
                </div>

                <div className="bg-card/50 backdrop-blur-xl border border-primary/10 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <div className="bg-primary/5 p-8 md:p-12 border-b border-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <Scale className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Acceptable Use Policy</h1>
                        </div>
                        <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px]">Last Updated: April 6, 2026</p>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="prose prose-invert prose-sm max-w-none space-y-10">
                            <p className="text-muted-foreground leading-relaxed text-lg">By using HustleSpark, you agree to use the Platform only for lawful purposes and in accordance with these guidelines.</p>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">01</span>
                                    Prohibited Conduct
                                </h2>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none ml-0 text-muted-foreground text-base">
                                    <li className="flex items-start gap-2 bg-muted/30 p-3 rounded-xl border border-primary/5">
                                        <span className="text-primary font-black mt-0.5">•</span>
                                        Harass, threaten, or abuse other users
                                    </li>
                                    <li className="flex items-start gap-2 bg-muted/30 p-3 rounded-xl border border-primary/5">
                                        <span className="text-primary font-black mt-0.5">•</span>
                                        Post fraudulent, misleading, or deceptive content
                                    </li>
                                    <li className="flex items-start gap-2 bg-muted/30 p-3 rounded-xl border border-primary/5">
                                        <span className="text-primary font-black mt-0.5">•</span>
                                        Promote illegal activities or products
                                    </li>
                                    <li className="flex items-start gap-2 bg-muted/30 p-3 rounded-xl border border-primary/5">
                                        <span className="text-primary font-black mt-0.5">•</span>
                                        Upload copyrighted content without authorization
                                    </li>
                                    <li className="flex items-start gap-2 bg-muted/30 p-3 rounded-xl border border-primary/5">
                                        <span className="text-primary font-black mt-0.5">•</span>
                                        Spam other users via chat or listings
                                    </li>
                                    <li className="flex items-start gap-2 bg-muted/30 p-3 rounded-xl border border-primary/5">
                                        <span className="text-primary font-black mt-0.5">•</span>
                                        Misrepresent your identity or impersonate others
                                    </li>
                                    <li className="flex items-start gap-2 bg-muted/30 p-3 rounded-xl border border-primary/5">
                                        <span className="text-primary font-black mt-0.5">•</span>
                                        Attempt unauthorized access to the Platform
                                    </li>
                                    <li className="flex items-start gap-2 bg-muted/30 p-3 rounded-xl border border-primary/5">
                                        <span className="text-primary font-black mt-0.5">•</span>
                                        Use automated tools to scrape platform data
                                    </li>
                                    <li className="flex items-start gap-2 bg-muted/30 p-3 rounded-xl border border-primary/5">
                                        <span className="text-primary font-black mt-0.5">•</span>
                                        Post discriminatory, hateful, or harmful content
                                    </li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">02</span>
                                    Consequences
                                </h2>
                                <div className="space-y-2 text-muted-foreground text-base">
                                    <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-destructive" /> Content removal</p>
                                    <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-destructive" /> Account suspension or permanent termination</p>
                                    <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-destructive" /> Reporting to law enforcement where applicable</p>
                                </div>
                                <p className="text-muted-foreground leading-relaxed text-base italic pt-4">HustleSpark reserves the right to determine what constitutes a violation of this policy at our sole discretion.</p>
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