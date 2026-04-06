import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="container max-w-4xl py-16">
            <div className="mb-8">
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary">← Back to Home</Link>
            </div>
            <div className="prose prose-sm max-w-none space-y-6">
                <h1 className="text-4xl font-black">Terms of Service</h1>
                <p className="text-muted-foreground">Last Updated: April 6, 2026</p>

                <h2 className="text-2xl font-bold mt-8">1. Agreement to Terms</h2>
                <p>Welcome to HustleSpark ("HustleSpark," "we," "our," or "the Platform"), owned and operated by Guneet Arora, based in Texas, United States. By accessing or using hustlespark.net, you agree to be legally bound by these Terms of Service. If you do not agree, you must stop using the Platform immediately.</p>

                <h2 className="text-2xl font-bold mt-8">2. Description of Service</h2>
                <p>HustleSpark is an AI-powered platform that allows users to generate personalized side hustle and business ideas, create branding assets, build business blueprints and launch schedules, list and sell side hustle strategies on our peer-to-peer marketplace, purchase business strategies listed by other users, and communicate with buyers and sellers via our built-in chat system.</p>
                <p>Services are provided for informational and educational purposes only. HustleSpark does not guarantee financial success, income generation, profitability, market demand, or business viability. Users are solely responsible for their own decisions and outcomes.</p>

                <h2 className="text-2xl font-bold mt-8">3. Eligibility</h2>
                <p>To use the Platform you must be at least 13 years old, have written permission from a parent or legal guardian if under 18, provide accurate account information, and verify your email address upon registration. Users engaging in buying or selling on the marketplace must be at least 18 years old or have explicit parental consent.</p>

                <h2 className="text-2xl font-bold mt-8">4. Accounts and Security</h2>
                <p>You are responsible for maintaining the confidentiality of your login credentials, all activity that occurs under your account, and immediately notifying HustleSpark of any unauthorized access at guneet.ar2010@gmail.com.</p>

                <h2 className="text-2xl font-bold mt-8">5. Subscriptions and Payments</h2>
                <p>HustleSpark offers premium features through a subscription currently priced at $15 USD per month. Payments are processed securely through Stripe. By subscribing, you authorize recurring monthly billing and automatic renewal. You may cancel your subscription at any time through your account settings.</p>

                <h2 className="text-2xl font-bold mt-8">6. Marketplace Transactions</h2>
                <p><strong>Platform Fee:</strong> HustleSpark charges a 10% platform fee on all marketplace transactions. The seller receives 90% of the sale price.</p>
                <p><strong>Escrow System:</strong> All payments are held in escrow by HustleSpark until the buyer confirms receipt. Once confirmed, HustleSpark releases 90% to the seller's PayPal within 3 business days.</p>
                <p><strong>Sellers</strong> must deliver all promised assets within 3 business days of a confirmed purchase.</p>
                <p><strong>Buyers</strong> must confirm receipt of assets within 14 days of purchase.</p>
                <p>HustleSpark is not a party to transactions between users and does not guarantee the quality, safety, legality, or delivery of any listed Venture.</p>

                <h2 className="text-2xl font-bold mt-8">7. Listing Requirements</h2>
                <p>All marketplace listings must be truthful and accurate, legal under applicable law, non-misleading regarding potential earnings, and free from plagiarized or stolen content. HustleSpark reserves the right to reject or remove any listing at our sole discretion.</p>

                <h2 className="text-2xl font-bold mt-8">8. Acceptable Use</h2>
                <p>Users agree not to violate any laws, post fraudulent listings, impersonate HustleSpark staff, attempt to hack the Platform, scrape platform data, or harass other users. Violations may result in immediate account termination.</p>

                <h2 className="text-2xl font-bold mt-8">9. Intellectual Property</h2>
                <p>All platform content including software, algorithms, AI prompts, branding, and user interface elements is the exclusive property of HustleSpark. Users may not reproduce, reverse engineer, or create competing services based on our systems.</p>

                <h2 className="text-2xl font-bold mt-8">10. Disclaimers</h2>
                <p>The Platform is provided "as is" without warranties of any kind. We do not guarantee uninterrupted service, accuracy of AI-generated content, or financial outcomes.</p>

                <h2 className="text-2xl font-bold mt-8">11. Limitation of Liability</h2>
                <p>To the fullest extent permitted by law, HustleSpark and Guneet Arora shall not be liable for financial losses, business failures, disputes between users, or indirect or consequential damages arising from use of the Platform.</p>

                <h2 className="text-2xl font-bold mt-8">12. Governing Law</h2>
                <p>These Terms are governed by the laws of the State of Texas, United States.</p>

                <h2 className="text-2xl font-bold mt-8">13. Contact</h2>
                <p>Email: guneet.ar2010@gmail.com | Website: https://hustlespark.net</p>
            </div>
        </div>
    );
}
