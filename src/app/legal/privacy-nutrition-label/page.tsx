import { Metadata } from 'next';
export const metadata: Metadata = { title: 'Privacy Nutrition Label | HustleSpark' };
export default function PrivacyNutritionLabel() {
  return (
    <div className='container max-w-2xl py-16'>
      <h1 className='text-3xl font-black mb-2'>Privacy Nutrition Label</h1>
      <p className='text-muted-foreground mb-8'>What data HustleSpark collects and why.</p>
      <div className='space-y-6'>
        {[
          { label: 'Email Address', reason: 'Account creation and notifications', shared: 'Never sold', retention: 'Until account deleted' },
          { label: 'Date of Birth', reason: 'Age verification (13+ requirement)', shared: 'Never sold', retention: 'Until account deleted' },
          { label: 'PayPal Email', reason: 'Seller payout processing', shared: 'HustleSpark admin only', retention: 'Until listing removed' },
          { label: 'Phone Number', reason: 'Seller verification only', shared: 'Never sold', retention: 'Until account deleted' },
          { label: 'Hustle Content', reason: 'Marketplace listings', shared: 'Visible to buyers', retention: 'Until listing removed' },
          { label: 'Payment Data', reason: 'Processed by Stripe — we never store card details', shared: 'Stripe only', retention: 'Per Stripe policy' },
          { label: 'Usage Data', reason: 'Platform improvement', shared: 'Never sold', retention: '90 days' },
        ].map((item) => (
          <div key={item.label} className='border rounded-2xl p-5 space-y-2'>
            <h3 className='font-black text-lg'>{item.label}</h3>
            <p className='text-sm text-muted-foreground'><span className='font-bold text-foreground'>Why:</span> {item.reason}</p>
            <p className='text-sm text-muted-foreground'><span className='font-bold text-foreground'>Shared with:</span> {item.shared}</p>
            <p className='text-sm text-muted-foreground'><span className='font-bold text-foreground'>Kept for:</span> {item.retention}</p>
          </div>
        ))}
        <div className='bg-primary/5 border border-primary/20 rounded-2xl p-5'>
          <p className='text-sm font-bold'>We use AI (Google Gemini) to generate hustle ideas and marketplace copy. AI-generated content is clearly labeled.</p>
        </div>
        <p className='text-xs text-muted-foreground'>Questions? Email privacy@hustlespark.net</p>
      </div>
    </div>
  );
}
