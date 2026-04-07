import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Cookie } from 'lucide-react';

export default function CookiePolicyPage() {
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
                        Transparency Protocol
                    </div>
                </div>

                <div className="bg-card/50 backdrop-blur-xl border border-primary/10 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <div className="bg-primary/5 p-8 md:p-12 border-b border-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <Cookie className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Cookie Policy</h1>
                        </div>
                        <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px]">Last Updated: April 6, 2026</p>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="prose prose-invert prose-sm max-w-none space-y-10">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">01</span>
                                    What Are Cookies
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences, keep you logged in, and understand how you use the site.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">02</span>
                                    How HustleSpark Uses Cookies
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">HustleSpark uses cookies and similar technologies through our third-party service providers for the following purposes:</p>
                                
                                <div className="grid gap-4 mt-6">
                                    <div className="bg-muted/30 p-6 rounded-2xl border border-primary/5">
                                        <h3 className="text-lg font-black text-foreground mb-2">Essential Cookies</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">These are required for the Platform to function. They keep you logged in and maintain your session security. These cannot be disabled.</p>
                                        <ul className="text-xs space-y-2 text-primary font-bold uppercase tracking-wider">
                                            <li className="flex items-center gap-2">• Firebase Authentication</li>
                                            <li className="flex items-center gap-2">• Session Management</li>
                                        </ul>
                                    </div>

                                    <div className="bg-muted/30 p-6 rounded-2xl border border-primary/5">
                                        <h3 className="text-lg font-black text-foreground mb-2">Analytics Cookies</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">These help us understand how users interact with the Platform so we can improve it.</p>
                                        <ul className="text-xs space-y-2 text-primary font-bold uppercase tracking-wider">
                                            <li className="flex items-center gap-2">• Google Firebase Analytics</li>
                                        </ul>
                                    </div>

                                    <div className="bg-muted/30 p-6 rounded-2xl border border-primary/5">
                                        <h3 className="text-lg font-black text-foreground mb-2">Payment Cookies</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">These are set by our payment processors when you make or receive payments.</p>
                                        <ul className="text-xs space-y-2 text-primary font-bold uppercase tracking-wider">
                                            <li className="flex items-center gap-2">• Stripe Fraud Prevention</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">03</span>
                                    Third-Party Cookies
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">We use the following third-party services that may set their own cookies:</p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 text-base">
                                    <li><span className="font-bold text-foreground">Google Firebase</span> — authentication and analytics</li>
                                    <li><span className="font-bold text-foreground">Stripe</span> — payment processing</li>
                                </ul>
                                <p className="text-muted-foreground leading-relaxed text-base italic">Each of these services has their own cookie and privacy policies which govern their use of cookies.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">04</span>
                                    Managing Cookies
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">You can control cookies through your browser settings. However, disabling essential cookies may prevent you from logging in or using core platform features. Most browsers allow you to view, delete, and block cookies through their settings menu.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">05</span>
                                    Changes to This Policy
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated date.</p>
                            </section>

                            <div className="border-t border-primary/10 pt-8 mt-8">
                                <p className="text-sm text-muted-foreground font-medium italic">Contact: <a href="mailto:guneet.ar2010@gmail.com" className="text-primary hover:underline not-italic font-bold">guneet.ar2010@gmail.com</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
