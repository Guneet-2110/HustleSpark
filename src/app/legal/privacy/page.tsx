import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Fingerprint } from 'lucide-react';

export default function PrivacyPage() {
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
                        Data Protection Active
                    </div>
                </div>

                <div className="bg-card/50 backdrop-blur-xl border border-primary/10 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <div className="bg-primary/5 p-8 md:p-12 border-b border-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <Fingerprint className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Privacy Policy</h1>
                        </div>
                        <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px]">Last Updated: April 6, 2026</p>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="prose prose-invert prose-sm max-w-none space-y-10">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">01</span>
                                    Introduction
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">HustleSpark ("we," "our," or "us") respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, and safeguard your data when you visit hustlespark.net.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">02</span>
                                    Information We Collect
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">We collect information that you provide directly to us, including:</p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 text-base">
                                    <li>Account credentials (email address, password).</li>
                                    <li>Profile information (age, skills, interests).</li>
                                    <li>Payment information (processed securely through Stripe).</li>
                                    <li>Communication data (messages sent via our built-in chat system).</li>
                                    <li>Content you generate (AI hustle ideas, branding assets).</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">03</span>
                                    How We Use Your Information
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">We use the information we collect to:</p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 text-base">
                                    <li>Provide and maintain our AI generation services.</li>
                                    <li>Process marketplace transactions and escrow payments.</li>
                                    <li>Facilitate communication between buyers and sellers.</li>
                                    <li>Send service-related notifications and updates.</li>
                                    <li>Improve our AI algorithms and user experience.</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">04</span>
                                    Data Sharing and Third Parties
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">We do not sell your personal information. We share data only with trusted service providers necessary to operate the Platform:</p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 text-base">
                                    <li><strong>Stripe:</strong> For secure payment processing.</li>
                                    <li><strong>PayPal:</strong> For marketplace seller payouts.</li>
                                    <li><strong>Firebase (Google):</strong> For database, authentication, and hosting services.</li>
                                    <li><strong>Google AI:</strong> To process prompts for AI generation.</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">05</span>
                                    Data Security
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">06</span>
                                    Your Rights
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">Depending on your location, you may have rights to access, correct, or delete your personal data. You can manage most of your information through your account settings or by contacting us at guneet.ar2010@gmail.com.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">07</span>
                                    Children's Privacy
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">HustleSpark is not intended for children under 13. We do not knowingly collect data from children under this age.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">08</span>
                                    Changes to This Policy
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">09</span>
                                    Contact Us
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">If you have any questions about this Privacy Policy, please contact us at guneet.ar2010@gmail.com.</p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}