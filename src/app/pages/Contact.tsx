import { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-20 lg:pt-24 min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-3" style={{ fontFamily: 'var(--font-body)' }}>Get in Touch</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 0.92 }}>
            Contact Us
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left */}
          <div>
            <p className="text-gray-500 text-sm leading-relaxed mb-10" style={{ fontFamily: 'var(--font-body)' }}>
              Whether you're looking to source products from China, discuss bulk orders, explore dropshipping, or learn more about our trade services — our team is ready to assist you within 24 hours.
            </p>
            <div className="space-y-6">
              {[
                { Icon: MapPin, label: 'Our Office', value: 'Nigeria (Head Office)' },
                { Icon: Phone, label: 'Phone', value: '+234 815 456 1953' },
                { Icon: Mail, label: 'Email', value: 'Ebemglobal@gmail.com' },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-10 h-10 border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-0.5" style={{ fontFamily: 'var(--font-body)' }}>{label}</p>
                    <p className="text-gray-900 text-sm" style={{ fontFamily: 'var(--font-body)' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-gray-50 border border-gray-100">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2" style={{ fontFamily: 'var(--font-body)' }}>Business Hours</p>
              <p className="text-sm text-gray-600" style={{ fontFamily: 'var(--font-body)' }}>Monday – Friday: 9:00 AM – 6:00 PM WAT</p>
              <p className="text-sm text-gray-600" style={{ fontFamily: 'var(--font-body)' }}>Saturday: 10:00 AM – 3:00 PM WAT</p>
              <p className="text-sm text-gray-400 mt-2" style={{ fontFamily: 'var(--font-body)' }}>WhatsApp available for trade enquiries</p>
            </div>
          </div>

          {/* Right — Form */}
          <div>
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-5">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>Message Sent</h3>
                <p className="text-gray-500 text-sm mt-3">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2" style={{ fontFamily: 'var(--font-body)' }}>Name *</label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" className="w-full px-4 py-3 border border-gray-200 bg-gray-50 focus:outline-none focus:border-black focus:bg-white text-sm transition-all" style={{ fontFamily: 'var(--font-body)' }} />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2" style={{ fontFamily: 'var(--font-body)' }}>Email *</label>
                    <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" className="w-full px-4 py-3 border border-gray-200 bg-gray-50 focus:outline-none focus:border-black focus:bg-white text-sm transition-all" style={{ fontFamily: 'var(--font-body)' }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2" style={{ fontFamily: 'var(--font-body)' }}>Subject *</label>
                  <input required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="How can we help?" className="w-full px-4 py-3 border border-gray-200 bg-gray-50 focus:outline-none focus:border-black focus:bg-white text-sm transition-all" style={{ fontFamily: 'var(--font-body)' }} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2" style={{ fontFamily: 'var(--font-body)' }}>Message *</label>
                  <textarea required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={6} placeholder="Tell us about your sourcing needs..." className="w-full px-4 py-3 border border-gray-200 bg-gray-50 focus:outline-none focus:border-black focus:bg-white text-sm transition-all resize-none" style={{ fontFamily: 'var(--font-body)' }} />
                </div>
                <button type="submit" className="w-full py-4 bg-black text-white text-xs uppercase tracking-widest hover:scale-[1.02] hover:shadow-xl transition-all duration-200" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
