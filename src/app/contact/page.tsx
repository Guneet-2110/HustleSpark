import Link from 'next/link';
import { Mail, Clock, ShieldCheck, MessageSquare, ArrowLeft, Headphones } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
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
                        Support Priority Active
                    </div>
                </div>

                <div className="bg-card/50 backdrop-blur-xl border border-primary/10 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <div className="bg-primary/5 p-8 md:p-12 border-b border-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <Headphones className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Contact & Support</h1>
                        </div>
                        <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl font-medium">
                            Have a question, issue, or feedback? We're here to help. HustleSpark is run by a small team and we take every message seriously.
                        </p>
                    </div>

                    <div className="p-8 md:p-12 space-y-12">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <Card className="rounded-[2rem] border-primary/10 bg-muted/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-3 text-lg font-black">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Mail className="h-4 w-4 text-primary" />
                                        </div>
                                        General Support
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground leading-relaxed">For general questions, account issues, or platform feedback.</p>
                                    <a href="mailto:guneet.ar2010@gmail.com" className="inline-flex items-center text-primary font-black hover:underline text-sm uppercase tracking-wider">
                                        guneet.ar2010@gmail.com
                                    </a>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2rem] border-primary/10 bg-muted/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-3 text-lg font-black">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <ShieldCheck className="h-4 w-4 text-primary" />
                                        </div>
                                        Marketplace Disputes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground leading-relaxed">For buyer/seller disputes, refund requests, or escrow issues.</p>
                                    <a href="mailto:guneet.ar2010@gmail.com" className="inline-flex items-center text-primary font-black hover:underline text-sm uppercase tracking-wider">
                                        guneet.ar2010@gmail.com
                                    </a>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2rem] border-primary/10 bg-muted/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-3 text-lg font-black">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <MessageSquare className="h-4 w-4 text-primary" />
                                        </div>
                                        Legal & DMCA
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground leading-relaxed">For legal inquiries, DMCA takedown requests, or privacy concerns.</p>
                                    <a href="mailto:guneet.ar2010@gmail.com" className="inline-flex items-center text-primary font-black hover:underline text-sm uppercase tracking-wider">
                                        guneet.ar2010@gmail.com
                                    </a>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2rem] border-primary/10 bg-muted/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-3 text-lg font-black">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Clock className="h-4 w-4 text-primary" />
                                        </div>
                                        Response Times
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <ul className="text-xs font-bold uppercase tracking-widest text-muted-foreground space-y-2">
                                        <li className="flex justify-between items-center bg-background/50 p-2 rounded-lg">
                                            <span>General support</span>
                                            <span className="text-primary font-black">48 Hours</span>
                                        </li>
                                        <li className="flex justify-between items-center bg-background/50 p-2 rounded-lg">
                                            <span>Marketplace disputes</span>
                                            <span className="text-primary font-black">5 Business Days</span>
                                        </li>
                                        <li className="flex justify-between items-center bg-background/50 p-2 rounded-lg">
                                            <span>Minor safety</span>
                                            <span className="text-primary font-black">24 Hours</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="rounded-[2.5rem] border-primary/20 bg-primary/5 overflow-hidden shadow-inner">
                            <CardContent className="p-8 md:p-12 text-center space-y-6">
                                <h2 className="text-3xl font-black tracking-tight">Before You Email</h2>
                                <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto font-medium">Check our legal pages for answers to common questions about refunds, marketplace rules, and privacy.</p>
                                <div className="flex flex-wrap justify-center gap-4 mt-4">
                                    <Button variant="outline" asChild className="rounded-2xl h-12 px-6 border-2 font-bold hover:bg-primary/10 transition-all active:scale-95">
                                        <Link href="/legal/refunds">Refund Policy</Link>
                                    </Button>
                                    <Button variant="outline" asChild className="rounded-2xl h-12 px-6 border-2 font-bold hover:bg-primary/10 transition-all active:scale-95">
                                        <Link href="/legal/marketplace">Marketplace Policy</Link>
                                    </Button>
                                    <Button variant="outline" asChild className="rounded-2xl h-12 px-6 border-2 font-bold hover:bg-primary/10 transition-all active:scale-95">
                                        <Link href="/legal/privacy">Privacy Policy</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="pt-8 border-t border-primary/10 text-center space-y-2">
                            <p className="text-sm text-muted-foreground font-medium tracking-tight">HustleSpark is owned and operated by Guneet Arora, Texas, United States.</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">© 2026 HustleSpark. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}