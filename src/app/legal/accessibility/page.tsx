import { Metadata } from 'next';
export const metadata: Metadata = { title: 'Accessibility Statement | HustleSpark' };
export default function AccessibilityStatement() {
  return (
    <div className='container max-w-2xl py-16 space-y-6'>
      <h1 className='text-3xl font-black'>Accessibility Statement</h1>
      <p className='text-muted-foreground'>Last updated: 2026</p>
      <p>HustleSpark is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards.</p>
      <h2 className='text-xl font-black'>Our Commitment</h2>
      <p>We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. These guidelines explain how to make web content more accessible to people with disabilities.</p>
      <h2 className='text-xl font-black'>Measures We Take</h2>
      <ul className='list-disc pl-6 space-y-2 text-muted-foreground'>
        <li>Semantic HTML structure throughout the platform</li>
        <li>Keyboard navigation support</li>
        <li>Sufficient color contrast ratios</li>
        <li>Alt text on all meaningful images</li>
        <li>Clear focus indicators</li>
        <li>Screen reader compatible components</li>
      </ul>
      <h2 className='text-xl font-black'>Known Limitations</h2>
      <p className='text-muted-foreground'>Some AI-generated content may not always meet accessibility standards. We are actively working to improve this.</p>
      <h2 className='text-xl font-black'>Feedback</h2>
      <p>We welcome feedback on the accessibility of HustleSpark. Please contact us at <a href='mailto:accessibility@hustlespark.net' className='text-primary underline'>accessibility@hustlespark.net</a></p>
    </div>
  );
}
