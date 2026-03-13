export default function DeliveryPolicy() {
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
          EBEM Global - Delivery Policy
        </h1>
        <p className="text-gray-500 text-sm mt-4" style={{ fontFamily: 'var(--font-body)' }}>
          Effective Date: March 13, 2026
        </p>

        <div className="mt-10 space-y-10 text-gray-600 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
          <section>
            <h2 className="text-black mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
              1. Order Processing Time
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Orders are processed within 1 to 2 business days after payment confirmation.</li>
              <li>You will receive email or SMS notifications for order confirmation and shipping updates.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-black mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
              2. Shipping and Delivery Times
            </h2>
            <p className="mb-3">Delivery times vary by location and shipping method:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Standard delivery (within Nigeria): 3 to 7 business days.</li>
              <li>International delivery: timelines depend on destination and customs.</li>
            </ul>
            <p className="mt-4">Tracking information will be provided once the item is shipped.</p>
          </section>

          <section>
            <h2 className="text-black mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
              3. Shipping Fees
            </h2>
            <p className="mb-3">Shipping costs are displayed during checkout and are added to your order total.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>If an item is returned due to fault or error on our part, we may refund your shipping fee.</li>
              <li>For returns due to change of mind, shipping fees are not refundable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-black mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
              4. Delivery Issues
            </h2>
            <p className="mb-3">If your order is delayed, missing, or damaged:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Contact us at support@ebemglobal.com with your order number and details.</li>
              <li>We will work with our delivery partners to investigate and resolve the issue.</li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
