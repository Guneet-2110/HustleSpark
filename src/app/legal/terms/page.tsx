import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react';

export default function TermsPage() {
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
                        Secure Document
                    </div>
                </div>

                <div className="bg-card/50 backdrop-blur-xl border border-primary/10 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <div className="bg-primary/5 p-8 md:p-12 border-b border-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <FileText className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Terms of Service</h1>
                        </div>
                        <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px]">Last Updated: April 6, 2026</p>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="prose prose-invert prose-sm max-w-none space-y-10">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">01</span>
                                    Agreement to Terms
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">Welcome to HustleSpark ("HustleSpark," "we," "our," or "the Platform"), owned and operated by Guneet Arora, based in Texas, United States. By accessing or using hustlespark.net, you agree to be legally bound by these Terms of Service. If you do not agree, you must stop using the Platform immediately.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">02</span>
                                    Description of Service
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">HustleSpark is an AI-powered platform that allows users to generate personalized side hustle and business ideas, create branding assets, build business blueprints and launch schedules, list and sell side hustle strategies on our peer-to-peer marketplace, purchase business strategies listed by other users, and communicate with buyers and sellers via our built-in chat system.</p>
                                <p className="text-muted-foreground leading-relaxed text-base">Services are provided for informational and educational purposes only. HustleSpark does not guarantee financial success, income generation, profitability, market demand, or business viability. Users are solely responsible for their own decisions and outcomes.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">03</span>
                                    Eligibility
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">To use the Platform you must be at least 13 years old, have written permission from a parent or legal guardian if under 18, provide accurate account information, and verify your email address upon registration. Users engaging in buying or selling on the marketplace must be at least 18 years old or have explicit parental consent.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">04</span>
                                    Accounts and Security
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">You are responsible for maintaining the confidentiality of your login credentials, all activity that occurs under your account, and immediately notifying HustleSpark of any unauthorized access at guneet.ar2010@gmail.com.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">05</span>
                                    Subscriptions and Payments
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">HustleSpark offers premium features through a subscription currently priced at $15 USD per month. Payments are processed securely through Stripe. By subscribing, you authorize recurring monthly billing and automatic renewal. You may cancel your subscription at any time through your account settings.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">06</span>
                                    Marketplace Transactions
                                </h2>
                                <div className="space-y-4 text-muted-foreground leading-relaxed text-base">
                                    <p><strong>Platform Fee:</strong> HustleSpark charges a 10% platform fee on all marketplace transactions. The seller receives 90% of the sale price.</p>
                                    <p><strong>Escrow System:</strong> All payments are held in escrow by HustleSpark until the buyer confirms receipt. Once confirmed, HustleSpark releases 90% to the seller's PayPal within 3 business days.</p>
                                    <p><strong>Sellers</strong> must deliver all promised assets within 3 business days of a confirmed purchase.</p>
                                    <p><strong>Buyers</strong> must confirm receipt of assets within 14 days of purchase.</p>
                                    <p>HustleSpark is not a party to transactions between users and does not guarantee the quality, safety, legality, or delivery of any listed Venture.</p>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">07</span>
                                    Listing Requirements
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">All marketplace listings must be truthful and accurate, legal under applicable law, non-misleading regarding potential earnings, and free from plagiarized or stolen content. HustleSpark reserves the right to reject or remove any listing at our sole discretion.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">08</span>
                                    Acceptable Use
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">Users agree not to violate any laws, post fraudulent listings, impersonate HustleSpark staff, attempt to hack the Platform, scrape platform data, or harass other users. Violations may result in immediate account termination.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">09</span>
                                    Intellectual Property
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">All platform content including software, algorithms, AI prompts, branding, and user interface elements is the exclusive property of HustleSpark. Users may not reproduce, reverse engineer, or create competing services based on our systems.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">10</span>
                                    Disclaimers
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">The Platform is provided "as is" without warranties of any kind. We do not guarantee uninterrupted service, accuracy of AI-generated content, or financial outcomes.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">11</span>
                                    Limitation of Liability
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">To the fullest extent permitted by law, HustleSpark and Guneet Arora shall not be liable for financial losses, business failures, disputes between users, or indirect or consequential damages arising from use of the Platform.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">12</span>
                                    Governing Law
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">These Terms are governed by the laws of the State of Texas, United States.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs">13</span>
                                    Contact
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base">Email: guneet.ar2010@gmail.com | Website: https://hustlespark.net</p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}