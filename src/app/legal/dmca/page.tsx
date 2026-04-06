import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Copyright } from 'lucide-react';

export default function DMCAPage() {
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
                        Rights Protection Active
                    </div>
                </div>

                <div className="bg-card/50 backdrop-blur-xl border border-primary/10 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <div className="bg-primary/5 p-8 md:p-12 border-b border-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <Copyright className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Copyright / DMCA</h1>
                        </div>
                        <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px]">Last Updated: April 6, 2026</p>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="prose prose-invert prose-sm max-w-none space-y-10">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">01</span>
                                    DMCA Takedown Requests
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">HustleSpark respects intellectual property rights. If you believe content on our Platform infringes your copyright, submit a DMCA takedown request to guneet.ar2010@gmail.com including:</p>
                                <ol className="list-decimal list-inside text-muted-foreground space-y-2 ml-4 text-base">
                                    <li>Your full legal name and contact information</li>
                                    <li>A description of the copyrighted work you claim has been infringed</li>
                                    <li>The URL or location of the allegedly infringing content</li>
                                    <li>A statement of good faith belief that the use is unauthorized</li>
                                    <li>A statement, under penalty of perjury, that the information is accurate and you are authorized to act</li>
                                    <li>Your electronic or physical signature</li>
                                </ol>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">02</span>
                                    Response Process
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">Upon receiving a valid DMCA notice, HustleSpark will review the complaint within 5 business days, remove infringing content if the claim is valid, notify the user who submitted the content, and allow the user to submit a counter-notice if they believe the takedown was in error.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">03</span>
                                    Repeat Infringers
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">HustleSpark will terminate the accounts of users who are repeat copyright infringers.</p>
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