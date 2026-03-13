export default function RefundReturnPolicy() {
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
          EBEM Global - Refund & Return Policy
        </h1>
        <p className="text-gray-500 text-sm mt-4" style={{ fontFamily: 'var(--font-body)' }}>
          Effective Date: March 13, 2026
        </p>

        <div className="mt-10 space-y-10 text-gray-600 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
          <section>
            <p className="mb-4">
              At EBEM Global ("we", "us", "our"), we aim to make shopping with us simple and fair. If you are not fully satisfied with your purchase,
              this policy explains how returns, exchanges, and refunds work.
            </p>
          </section>

          <section>
            <h2 className="text-black mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
              1. Eligibility for Returns
            </h2>
            <p className="mb-3">You may request a return or refund within 14 days of delivery if:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The product is unused, undamaged, and in its original packaging.</li>
              <li>You provide proof of purchase (order number or receipt).</li>
            </ul>
            <p className="mt-4 font-medium text-black">Items Not Eligible for Return:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Digital products, downloadable content, or services already delivered.</li>
              <li>Custom or made-to-order goods.</li>
              <li>Gift items or promotional products.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-black mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
              2. How to Request a Return or Refund
            </h2>
            <p className="mb-3">To start a return or refund:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Email us at support@ebemglobal.com within the return window.</li>
              <li>Include your order number, product name, and reason for return.</li>
              <li>Attach clear photos if the item is defective or incorrect.</li>
            </ol>
            <p className="mt-4">We will review your request and provide return instructions.</p>
          </section>

          <section>
            <h2 className="text-black mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
              3. Refund Processing
            </h2>
            <p className="mb-3">
              Approved refunds are issued back to the original payment method via Paystack. Refunds typically appear within 5 to 10 business days of
              approval, depending on your bank and payment method.
            </p>
            <p className="mb-3">Please note:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Paystack processing fees are non-refundable. These are charges for payment processing and cannot be returned.</li>
              <li>Shipping fees are refundable only if the item was faulty or sent incorrectly.</li>
              <li>If the product was delivered correctly and you simply changed your mind, shipping fees may not be refunded.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-black mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
              4. Exchanges
            </h2>
            <p>
              If a product arrives defective or damaged, we will replace it with the same item (subject to availability). If unavailable, we may offer a
              full refund.
            </p>
          </section>

          <section>
            <h2 className="text-black mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
              5. Cancellations
            </h2>
            <p>Orders can only be cancelled before dispatch or shipping. Once the order has been shipped, cancellation is not possible.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
