export default function PrivacyPolicy() {
  return (
    <div className="pt-20 lg:pt-24 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <p
          className="text-gray-400 text-xs uppercase tracking-[0.3em] mb-3"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Policy
        </p>
        <h1
          className="text-black"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 0.95 }}
        >
          EBEM Global - Privacy Policy
        </h1>
        <p className="text-gray-500 text-sm mt-4" style={{ fontFamily: 'var(--font-body)' }}>
          Effective Date: March 13, 2026
        </p>

        <div className="mt-10 space-y-10 text-gray-600 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
          <section>
            <p className="mb-4">
              At EBEM Global ("we", "us", "our"), we value your privacy and are committed to protecting your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-black mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
              1. What We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Name, email, phone number.</li>
              <li>Shipping and billing addresses.</li>
              <li>Payment information (processed securely via Paystack).</li>
              <li>Order history and customer support information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-black mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
              2. How We Use Your Data
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Process and fulfill orders.</li>
              <li>Communicate order updates and support responses.</li>
              <li>Improve our services and website experience.</li>
              <li>Comply with legal obligations (e.g., financial record retention).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-black mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
              3. Sharing Your Data
            </h2>
            <p className="mb-3">We may share your information with:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Paystack - to process payments and refunds.</li>
              <li>Service providers working for us (e.g., delivery partners).</li>
              <li>Law enforcement or government if required by law.</li>
            </ul>
            <p className="mt-4">We will not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-black mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
              4. Security
            </h2>
            <p>We use industry-standard measures (encryption, secure servers) to safeguard personal and payment information.</p>
          </section>

          <section>
            <h2 className="text-black mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
              5. Your Rights
            </h2>
            <p>You can contact us to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>View the data we hold about you.</li>
              <li>Request corrections.</li>
              <li>Request deletion if allowed under law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-black mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
              6. Children's Privacy
            </h2>
            <p>
              Our sites and services are intended for persons 18 years or older. We do not knowingly collect personal data from minors.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
