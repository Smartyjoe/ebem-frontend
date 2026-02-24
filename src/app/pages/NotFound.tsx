import { Link } from 'react-router';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-6">
      <p className="text-gray-200 select-none" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(6rem, 20vw, 16rem)', lineHeight: 1 }}>404</p>
      <div style={{ marginTop: '-2rem' }}>
        <h1 className="mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1 }}>Page Not Found</h1>
        <p className="text-gray-500 text-sm mb-8" style={{ fontFamily: 'var(--font-body)' }}>This page doesn't exist — but we can probably source whatever you're looking for.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="px-8 py-3 bg-black text-white text-xs uppercase tracking-widest hover:scale-[1.02] transition-all" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Back to Home
          </Link>
          <Link to="/shop" className="px-8 py-3 border border-gray-200 text-black text-xs uppercase tracking-widest hover:border-black transition-all" style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>
            Browse Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
