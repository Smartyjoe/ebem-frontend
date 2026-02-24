import { useEffect, useRef, useState } from 'react';
import { X, Sparkles, Search, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { searchWithAi, type AiRecommendation } from '../../services/aiSearch';
import { formatNaira } from '../../utils/currency';

const PLACEHOLDERS = [
  'Search any product...',
  'Ask AI for recommendations...',
  'AI powered search...',
  'Find the best factory price...',
];

const SUGGESTIONS = [
  'Best in-stock smartphone under 300k',
  'Affordable blender for home use',
  'Laptop for design work and battery life',
  'Good quality wireless earbuds',
  'Best budget kitchen appliances',
  'Fashion sneakers for daily wear',
];

export function AISearchPanel() {
  const { activePanel, closePanel, openPanel, addToCart, setPrefillRequest } = useApp();
  const [query, setQuery] = useState('');
  const [phIndex, setPhIndex] = useState(0);
  const [phChar, setPhChar] = useState(0);
  const [displayPh, setDisplayPh] = useState('');
  const [results, setResults] = useState<AiRecommendation[]>([]);
  const [insights, setInsights] = useState('');
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isOpen = activePanel === 'search';

  useEffect(() => {
    if (query) {
      setDisplayPh('');
      return;
    }
    const target = PLACEHOLDERS[phIndex];
    if (phChar < target.length) {
      const timer = setTimeout(() => {
        setDisplayPh(target.slice(0, phChar + 1));
        setPhChar((count) => count + 1);
      }, 60);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setPhChar(0);
      setDisplayPh('');
      setPhIndex((index) => (index + 1) % PLACEHOLDERS.length);
    }, 2000);
    return () => clearTimeout(timer);
  }, [phChar, phIndex, query]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 350);
  }, [isOpen]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setInsights('');
      setFollowUps([]);
      setError(null);
      setLoading(false);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await searchWithAi(trimmed, 6);
        if (!active) return;
        setResults(response.recommendations);
        setInsights(response.insights);
        setFollowUps(response.followUpQuestions);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'AI search failed');
      } finally {
        if (active) setLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const notFound = !loading && !error && query.trim().length > 0 && results.length === 0;

  const handleRequestThis = () => {
    setPrefillRequest(query);
    openPanel('request');
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-400 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
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
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest">Powered by AI</p>
              <h3 className="text-gray-900" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', lineHeight: 1 }}>
                AI Search Assistant
              </h3>
            </div>
          </div>
          <button onClick={closePanel} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="relative mb-6">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={displayPh + (query ? '' : '|')}
              className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 bg-gray-50 focus:outline-none focus:border-black focus:bg-white text-sm transition-all shadow-sm"
              style={{ fontFamily: 'var(--font-body)' }}
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {!query && (
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="px-3 py-2 bg-gray-50 hover:bg-black hover:text-white text-gray-700 text-xs rounded-full border border-gray-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: 'var(--font-body)' }}>
              Thinking through your request...
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600 mb-4" style={{ fontFamily: 'var(--font-body)' }}>
              {error}
            </p>
          )}

          {insights && !loading && (
            <div className="mb-5 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">AI Insight</p>
              <p className="text-sm text-gray-700 leading-relaxed">{insights}</p>
            </div>
          )}

          {results.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Recommended for you</p>
              <div className="space-y-4">
                {results.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 rounded-xl border border-gray-100 hover:border-black transition-all duration-200 hover:shadow-md group">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.badge === 'Pre-Order' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {item.badge}
                        </span>
                        <p className="text-gray-900 mt-1 text-sm" style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                          {item.name}
                        </p>
                        <p className="text-gray-900" style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                          {formatNaira(item.price)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.why}</p>
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

          {followUps.length > 0 && !loading && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Refine your search</p>
              <div className="flex flex-wrap gap-2">
                {followUps.map((question) => (
                  <button
                    key={question}
                    onClick={() => setQuery(question)}
                    className="px-3 py-2 bg-white hover:bg-black hover:text-white text-gray-700 text-xs rounded-full border border-gray-200 transition-all duration-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {notFound && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-900 mb-1" style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                Not in stock yet.
              </p>
              <p className="text-gray-400 text-sm mb-6">
                We do not currently have that item, but we can source it for you.
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
