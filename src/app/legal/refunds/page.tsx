import Link from 'next/link';
import { ArrowLeft, ShieldCheck, CircleDollarSign } from 'lucide-react';

export default function RefundPolicyPage() {
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
                        Buyer Protection Active
                    </div>
                </div>

                <div className="bg-card/50 backdrop-blur-xl border border-primary/10 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <div className="bg-primary/5 p-8 md:p-12 border-b border-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <CircleDollarSign className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Refund Policy</h1>
                        </div>
                        <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px]">Last Updated: April 6, 2026</p>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="prose prose-invert prose-sm max-w-none space-y-10">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">01</span>
                                    Subscriptions
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">HustleSpark provides digital services with immediate access upon payment. All subscription payments are generally non-refundable. Refunds may be issued for duplicate charges, technical errors preventing access, or billing mistakes. Requests must be submitted within 7 days to guneet.ar2010@gmail.com.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">02</span>
                                    Marketplace Transactions
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">All marketplace purchases are held in escrow until the buyer confirms receipt.</p>
                                
                                <div className="space-y-6 pt-4">
                                    <div className="bg-muted/30 p-6 rounded-2xl border border-primary/5">
                                        <h3 className="text-xl font-bold text-foreground mb-3">Buyer Refunds</h3>
                                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2 text-base">
                                            <li>If the seller fails to deliver within 3 business days, the buyer may request a full refund</li>
                                            <li>If assets don't match the listing, buyers may dispute within 7 days of delivery</li>
                                            <li>Once buyer confirms receipt, the transaction is final and non-refundable</li>
                                        </ul>
                                    </div>

                                    <div className="bg-muted/30 p-6 rounded-2xl border border-primary/5">
                                        <h3 className="text-xl font-bold text-foreground mb-3">Seller Payouts</h3>
                                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2 text-base">
                                            <li>Payouts are released within 3 business days of buyer confirmation</li>
                                            <li>If a refund is issued to a buyer, no payout will be made to the seller</li>
                                        </ul>
                                    </div>
                                </div>
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