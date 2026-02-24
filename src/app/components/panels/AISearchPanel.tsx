import { useEffect, useRef, useState } from 'react';
import { X, Sparkles, Search, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const PLACEHOLDERS = [
  'Search any product...',
  'Ask AI for recommendations...',
  'AI powered search...',
  'Find the best factory price...',
];

const SUGGESTIONS = [
  'iPhone 15 Pro Max',
  'Smart LED TV 55 inch',
  'Air Fryer Pro',
  'Running Shoes Nike',
  'Electric Scooter',
  'Wireless Earbuds',
];

const MOCK_RESULTS = [
  {
    id: '1',
    name: 'Pro Smartwatch X1',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1616640044918-0622649122f0?w=400&q=80',
    badge: 'Ready Stock',
  },
  {
    id: '7',
    name: 'Flagship Smartphone Pro',
    price: 210000,
    image: 'https://images.unsplash.com/photo-1651565278701-91da491200c2?w=400&q=80',
    badge: 'Pre-Order',
  },
  {
    id: '3',
    name: 'UltraBook Laptop 14"',
    price: 380000,
    image: 'https://images.unsplash.com/photo-1628072004495-19b19c64dee1?w=400&q=80',
    badge: 'Pre-Order',
  },
];

export function AISearchPanel() {
  const { activePanel, closePanel, openPanel, addToCart, setPrefillRequest } = useApp();
  const [query, setQuery] = useState('');
  const [phIndex, setPhIndex] = useState(0);
  const [phChar, setPhChar] = useState(0);
  const [displayPh, setDisplayPh] = useState('');
  const [results, setResults] = useState<typeof MOCK_RESULTS>([]);
  const [notFound, setNotFound] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isOpen = activePanel === 'search';

  // Typing placeholder animation
  useEffect(() => {
    if (query) { setDisplayPh(''); return; }
    const target = PLACEHOLDERS[phIndex];
    if (phChar < target.length) {
      const t = setTimeout(() => {
        setDisplayPh(target.slice(0, phChar + 1));
        setPhChar(c => c + 1);
      }, 60);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setPhChar(0);
        setDisplayPh('');
        setPhIndex(i => (i + 1) % PLACEHOLDERS.length);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [phChar, phIndex, query]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 400);
  }, [isOpen]);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); setNotFound(false); return; }
    const filtered = MOCK_RESULTS.filter(r =>
      r.name.toLowerCase().includes(q.toLowerCase())
    );
    setResults(filtered);
    setNotFound(filtered.length === 0);
  };

  const handleRequestThis = () => {
    setPrefillRequest(query);
    openPanel('request');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-400 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
        onClick={closePanel}
      />
      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full z-50 bg-white shadow-2xl flex flex-col transition-transform duration-400`}
        style={{
          width: 'min(460px, 100vw)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest">Powered by AI</p>
              <h3 className="text-gray-900" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', lineHeight: 1 }}>
                AI Search Assistant
              </h3>
            </div>
          </div>
          <button
            onClick={closePanel}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Search Input */}
          <div className="relative mb-6">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              ref={inputRef}
              value={query}
              onChange={e => handleSearch(e.target.value)}
              placeholder={displayPh + (query ? '' : '|')}
              className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 bg-gray-50 focus:outline-none focus:border-black focus:bg-white text-sm transition-all shadow-sm"
              style={{ fontFamily: 'var(--font-body)' }}
            />
            {query && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Suggestions */}
          {!query && (
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSearch(s)}
                    className="px-3 py-2 bg-gray-50 hover:bg-black hover:text-white text-gray-700 text-xs rounded-full border border-gray-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Recommended for you</p>
              <div className="space-y-4">
                {results.map(item => (
                  <div key={item.id} className="flex gap-4 p-3 rounded-xl border border-gray-100 hover:border-black transition-all duration-200 hover:shadow-md group">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.badge === 'Pre-Order' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {item.badge}
                        </span>
                        <p className="text-gray-900 mt-1 text-sm" style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>{item.name}</p>
                        <p className="text-gray-900" style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                          ₦{item.price.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, image: item.image, badge: item.badge })}
                        className="text-xs bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800 transition-all hover:scale-[1.02] w-fit"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Not Found */}
          {notFound && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-900 mb-1" style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                Not in stock yet.
              </p>
              <p className="text-gray-400 text-sm mb-6">
                We don't currently have that item — but we can source it from China for you.
              </p>
              <button
                onClick={handleRequestThis}
                className="flex items-center gap-2 mx-auto bg-black text-white px-6 py-3 rounded-full hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
              >
                <span className="text-sm">Request This Product</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}