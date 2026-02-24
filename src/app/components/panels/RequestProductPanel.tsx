import { useEffect, useRef, useState } from 'react';
import { X, Package, Upload, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { submitProductRequest } from '../../services/productRequests';

export function RequestProductPanel() {
  const { activePanel, closePanel, prefillRequest } = useApp();
  const isOpen = activePanel === 'request';

  const [form, setForm] = useState({ title: '', description: '', name: '', email: '' });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && prefillRequest) {
      setForm((state) => ({ ...state, title: prefillRequest }));
    }
  }, [isOpen, prefillRequest]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSubmitted(false);
        setForm({ title: '', description: '', name: '', email: '' });
        setFile(null);
        setPreview(null);
        setSubmitting(false);
        setError(null);
      }, 500);
    }
  }, [isOpen]);

  const handleFile = (nextFile: File) => {
    setFile(nextFile);
    if (nextFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => setPreview(event.target?.result as string);
      reader.readAsDataURL(nextFile);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await submitProductRequest({
        title: form.title,
        description: form.description,
        name: form.name,
        email: form.email,
        file,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-400 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
        onClick={closePanel}
      />
      <div
        className="fixed top-0 right-0 h-full z-50 bg-white shadow-2xl flex flex-col transition-transform duration-400"
        style={{
          width: 'min(460px, 100vw)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest">China Sourcing</p>
              <h3 className="text-gray-900" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', lineHeight: 1 }}>
                Request a Product
              </h3>
            </div>
          </div>
          <button onClick={closePanel} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {submitted ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-5">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="mb-2" style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem' }}>
                Request Sent
              </h3>
              <p className="text-gray-500 text-sm max-w-xs">
                Our sourcing team will contact you within 24-48 hours with pricing and availability.
              </p>
              <button onClick={closePanel} className="mt-8 px-8 py-3 bg-black text-white text-sm rounded-full hover:scale-[1.02] transition-all">
                Done
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Did not find what you need? Tell us what to source for you directly from China.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Product Title <span className="text-black">*</span>
                  </label>
                  <input
                    required
                    value={form.title}
                    onChange={(event) => setForm((state) => ({ ...state, title: event.target.value }))}
                    placeholder="What product are you looking for?"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-black focus:bg-white text-sm transition-all"
                    style={{ fontFamily: 'var(--font-body)' }}
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Description <span className="text-black">*</span>
                  </label>
                  <textarea
                    required
                    value={form.description}
                    onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))}
                    placeholder="Describe specifications, brand, quantity, budget, color, size..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-black focus:bg-white text-sm transition-all resize-none"
                    style={{ fontFamily: 'var(--font-body)' }}
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Reference File <span className="text-gray-400">(Optional)</span>
                  </label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      dragging ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*,video/*,.pdf"
                      className="hidden"
                      onChange={(event) => {
                        if (event.target.files?.[0]) handleFile(event.target.files[0]);
                      }}
                    />
                    {preview ? (
                      <img src={preview} alt="preview" className="w-24 h-24 object-cover rounded-lg mx-auto mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    )}
                    <p className="text-gray-400 text-xs">{file ? file.name : 'Drop image, video, or PDF here or click to browse'}</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <div className="mb-4">
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                      Your Name <span className="text-black">*</span>
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))}
                      placeholder="Full name"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-black focus:bg-white text-sm transition-all"
                      style={{ fontFamily: 'var(--font-body)' }}
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                      Email Address <span className="text-black">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-black focus:bg-white text-sm transition-all"
                      style={{ fontFamily: 'var(--font-body)' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-black text-white text-sm uppercase tracking-widest rounded-xl hover:scale-[1.02] hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>

                {error && <p className="text-center text-red-600 text-xs">{error}</p>}

                <p className="text-center text-gray-400 text-xs">Our sourcing team will respond within 24-48 hours.</p>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
