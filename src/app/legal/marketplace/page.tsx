import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Store } from 'lucide-react';

export default function MarketplacePolicyPage() {
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
                        Market Integrity Verified
                    </div>
                </div>

                <div className="bg-card/50 backdrop-blur-xl border border-primary/10 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <div className="bg-primary/5 p-8 md:p-12 border-b border-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <Store className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Marketplace Policy</h1>
                        </div>
                        <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px]">Last Updated: April 6, 2026</p>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="prose prose-invert prose-sm max-w-none space-y-10">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">01</span>
                                    Overview
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">HustleSpark operates a peer-to-peer marketplace where users can buy and sell side hustle strategies ("Ventures").</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">02</span>
                                    Listing Requirements
                                </h2>
                                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 text-base">
                                    <li>Truthful, accurate, and complete</li>
                                    <li>Legal under all applicable laws</li>
                                    <li>Non-misleading regarding potential earnings</li>
                                    <li>Original content you have the right to sell</li>
                                    <li>Submitted with a valid PayPal payout email</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">03</span>
                                    Platform Fee
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">HustleSpark charges a 10% platform fee on all completed transactions. The seller receives 90% of the sale price.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">04</span>
                                    Escrow and Delivery
                                </h2>
                                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 text-base">
                                    <li>All payments are held in escrow by HustleSpark</li>
                                    <li>Sellers must deliver all assets within 3 business days</li>
                                    <li>Buyers must confirm receipt within 14 days of delivery</li>
                                    <li>Payouts are released within 3 business days of buyer confirmation</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">05</span>
                                    Prohibited Listings
                                </h2>
                                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 text-base">
                                    <li>Guaranteed income claims</li>
                                    <li>Illegal businesses or activities</li>
                                    <li>Plagiarized or stolen strategies</li>
                                    <li>Adult, harmful, or dangerous content</li>
                                    <li>Content violating intellectual property rights</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">06</span>
                                    Disputes
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">Contact guneet.ar2010@gmail.com with transaction details. HustleSpark will mediate and make a final decision within 5 business days.</p>
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