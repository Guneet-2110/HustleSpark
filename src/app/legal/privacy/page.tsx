import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="container max-w-4xl py-16">
            <div className="mb-8">
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary">← Back to Home</Link>
            </div>
            <div className="prose prose-sm max-w-none space-y-6">
                <h1 className="text-4xl font-black">Privacy Policy</h1>
                <p className="text-muted-foreground">Last Updated: April 6, 2026</p>

                <h2 className="text-2xl font-bold mt-8">1. Introduction</h2>
                <p>HustleSpark ("we," "our," or "us") respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, and safeguard your data when you visit hustlespark.net.</p>

                <h2 className="text-2xl font-bold mt-8">2. Information We Collect</h2>
                <p>We collect information that you provide directly to us, including:</p>
                <ul>
                    <li>Account credentials (email address, password).</li>
                    <li>Profile information (age, skills, interests).</li>
                    <li>Payment information (processed securely through Stripe).</li>
                    <li>Communication data (messages sent via our built-in chat system).</li>
                    <li>Content you generate (AI hustle ideas, branding assets).</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8">3. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul>
                    <li>Provide and maintain our AI generation services.</li>
                    <li>Process marketplace transactions and escrow payments.</li>
                    <li>Facilitate communication between buyers and sellers.</li>
                    <li>Send service-related notifications and updates.</li>
                    <li>Improve our AI algorithms and user experience.</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8">4. Data Sharing and Third Parties</h2>
                <p>We do not sell your personal information. We share data only with trusted service providers necessary to operate the Platform:</p>
                <ul>
                    <li><strong>Stripe:</strong> For secure payment processing.</li>
                    <li><strong>PayPal:</strong> For marketplace seller payouts.</li>
                    <li><strong>Firebase (Google):</strong> For database, authentication, and hosting services.</li>
                    <li><strong>Google AI:</strong> To process prompts for AI generation.</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8">5. Data Security</h2>
                <p>We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>

                <h2 className="text-2xl font-bold mt-8">6. Your Rights</h2>
                <p>Depending on your location, you may have rights to access, correct, or delete your personal data. You can manage most of your information through your account settings or by contacting us at guneet.ar2010@gmail.com.</p>

                <h2 className="text-2xl font-bold mt-8">7. Children's Privacy</h2>
                <p>HustleSpark is not intended for children under 13. We do not knowingly collect data from children under this age.</p>

                <h2 className="text-2xl font-bold mt-8">8. Changes to This Policy</h2>
                <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page.</p>

                <h2 className="text-2xl font-bold mt-8">9. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at guneet.ar2010@gmail.com.</p>
            </div>
        </div>
    );
}
