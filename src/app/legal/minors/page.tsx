import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Baby } from 'lucide-react';

export default function MinorsPolicyPage() {
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
                        Youth Protection Protocol
                    </div>
                </div>

                <div className="bg-card/50 backdrop-blur-xl border border-primary/10 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <div className="bg-primary/5 p-8 md:p-12 border-b border-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <Baby className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Terms for Minors & COPPA Compliance</h1>
                        </div>
                        <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px]">Last Updated: April 6, 2026</p>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="prose prose-invert prose-sm max-w-none space-y-10">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">01</span>
                                    Who This Applies To
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">This page applies to users under the age of 18. HustleSpark welcomes teenage entrepreneurs and is designed to be a safe, educational platform for young people to explore business ideas and develop entrepreneurial skills.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">02</span>
                                    Age Requirements
                                </h2>
                                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 text-base">
                                    <li><span className="font-bold text-foreground">Under 13:</span> HustleSpark does not knowingly allow children under 13 to create accounts. If we discover a user is under 13, their account will be immediately terminated and all data deleted.</li>
                                    <li><span className="font-bold text-foreground">Ages 13-17:</span> Users between 13 and 17 may use HustleSpark for idea generation, branding tools, and educational features with parental or guardian consent.</li>
                                    <li><span className="font-bold text-foreground">Marketplace Transactions:</span> Users under 18 may NOT buy or sell on the HustleSpark marketplace without explicit written parental or guardian consent. Real financial transactions require a parent or guardian to be involved.</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">03</span>
                                    COPPA Compliance
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">HustleSpark complies with the Children's Online Privacy Protection Act (COPPA). We do not knowingly collect personal information from children under 13. If you believe your child under 13 has created an account or provided personal information, please contact us immediately at guneet.ar2010@gmail.com and we will delete the information promptly.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">04</span>
                                    What We Collect From Minors
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">For users ages 13-17, we collect only the minimum information necessary to provide the service:</p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 text-base">
                                    <li>Email address (for account creation and verification)</li>
                                    <li>Usage data (to improve the platform)</li>
                                    <li>Content submitted by the user (hustle ideas, saved strategies)</li>
                                </ul>
                                <p className="text-muted-foreground leading-relaxed text-base italic">We do not sell personal information of minors to any third party.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">05</span>
                                    Parental Rights
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">Parents or guardians of minor users have the right to:</p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 text-base">
                                    <li>Review the personal information we have collected about their child</li>
                                    <li>Request deletion of their child's account and all associated data</li>
                                    <li>Refuse further collection of their child's information</li>
                                    <li>Revoke consent for marketplace participation at any time</li>
                                </ul>
                                <p className="text-muted-foreground leading-relaxed text-base italic">To exercise any of these rights, contact us at guneet.ar2010@gmail.com with your child's account email and your request.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">06</span>
                                    Safety for Minors
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">HustleSpark takes the safety of young users seriously. We:</p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 text-base">
                                    <li>Review all marketplace listings before they go live</li>
                                    <li>Monitor platform activity for inappropriate content</li>
                                    <li>Provide a safe messaging system for buyer/seller communication</li>
                                    <li>Do not display personal contact information publicly</li>
                                    <li>Encourage minors to involve a trusted adult in any financial transactions</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">07</span>
                                    Reporting Concerns
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">If you are a minor who feels unsafe or encounters inappropriate content on HustleSpark, or if you are a parent with concerns about your child's use of the platform, please contact us immediately at guneet.ar2010@gmail.com. We take all reports seriously and will respond within 24 hours.</p>
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