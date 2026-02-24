import { useScrollReveal } from '../../hooks/useScrollReveal';

const MARQUEE_ITEMS = [
  'Manufacturer Pricing',
  '·',
  'China to Africa Supply',
  '·',
  'Nigeria Ready Stock',
  '·',
  'Pre-Order Access',
  '·',
  'Bulk Sourcing',
  '·',
  'Verified Suppliers',
  '·',
  'Direct from Factory',
  '·',
  'Zero Middlemen',
  '·',
];

export function TrustBanner() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className="bg-black py-4 overflow-hidden">
      <div
        className="flex gap-8 whitespace-nowrap"
        style={{
          animation: 'marquee 30s linear infinite',
          width: 'max-content',
        }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            className={`text-xs uppercase tracking-widest ${item === '·' ? 'text-white/30' : 'text-white/70'}`}
            style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
          >
            {item}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
