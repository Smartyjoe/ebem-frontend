import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function CartPanel() {
  const { activePanel, closePanel, cartItems, removeFromCart, updateQuantity, cartTotal } = useApp();
  const isOpen = activePanel === 'cart';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-400 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
        onClick={closePanel}
      />
      {/* Panel — slides from LEFT */}
      <div
        className={`fixed top-0 left-0 h-full z-50 bg-white shadow-2xl flex flex-col transition-transform duration-400`}
        style={{
          width: 'min(460px, 100vw)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest">{cartItems.length} Items</p>
              <h3 className="text-gray-900" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', lineHeight: 1 }}>
                Your Cart
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

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-900 mb-1" style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>Cart is empty</p>
              <p className="text-gray-400 text-sm">Add products to get started.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        {item.badge && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${item.badge === 'Pre-Order' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                            {item.badge}
                          </span>
                        )}
                        <p className="text-gray-900 mt-0.5 text-sm" style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                          {item.name}
                        </p>
                        <p className="text-gray-900" style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-black transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm w-6 text-center" style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-black transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="px-8 py-6 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 text-sm uppercase tracking-widest">Subtotal</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>
                ₦{cartTotal.toLocaleString()}
              </span>
            </div>
            <p className="text-gray-400 text-xs mb-4">Shipping and taxes calculated at checkout</p>
            <button className="w-full py-4 bg-black text-white text-sm uppercase tracking-widest rounded-xl hover:scale-[1.02] hover:shadow-xl transition-all duration-200">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
