import { useState, useEffect } from 'react'
import './CustomerShop.css'

const API = 'http://127.0.0.1:8000/api'

// Emoji map (same as farmer dashboard)
const PRODUCT_EMOJIS = {
  carrot: '🥕', carrots: '🥕',
  tomato: '🍅', tomatoes: '🍅',
  potato: '🥔', potatoes: '🥔',
  onion: '🧅', onions: '🧅',
  corn: '🌽',
  rice: '🍚',
  wheat: '🌾',
  apple: '🍎', apples: '🍎',
  banana: '🍌', bananas: '🍌',
  mango: '🥭', mangoes: '🥭', mangos: '🥭',
  grapes: '🍇', grape: '🍇',
  orange: '🍊', oranges: '🍊',
  watermelon: '🍉',
  strawberry: '🍓', strawberries: '🍓',
  peas: '🫛', pea: '🫛',
  broccoli: '🥦',
  cauliflower: '🥦', cauliflowers: '🥦',
  pepper: '🌶️', peppers: '🌶️', chilli: '🌶️',
  garlic: '🧄',
  ginger: '🫚',
  mushroom: '🍄', mushrooms: '🍄',
  spinach: '🥬', lettuce: '🥬',
  cucumber: '🥒', cucumbers: '🥒',
  eggplant: '🍆', brinjal: '🍆',
  milk: '🥛',
  egg: '🥚', eggs: '🥚',
  honey: '🍯',
}

function getEmoji(name) {
  const key = name.toLowerCase().trim()
  return PRODUCT_EMOJIS[key] || '🌿'
}

/*
  CustomerShop — browse products, add to cart, place orders.
*/
function CustomerShop({ user }) {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])         // [{ product, qty }]
  const [showCart, setShowCart] = useState(false)
  const [orders, setOrders] = useState([])
  const [showOrders, setShowOrders] = useState(false)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProducts()
    fetchOrders()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/products`)
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error('Failed to fetch products:', err)
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API}/orders/${user.username}`)
      const data = await res.json()
      setOrders(data)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    }
  }

  const showToast = (msg, type = '') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Cart functions
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      }
      return [...prev, { product, qty: 1 }]
    })
    showToast(`🛒 ${product.name} added to cart!`, 'success')
  }

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const updateQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, qty: Math.max(0, item.qty + delta) }
            : item
        )
        .filter((item) => item.qty > 0)
    )
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  )

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  const placeOrder = async () => {
    if (cart.length === 0) return
    try {
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: user.username,
          items: cart.map((item) => ({
            product_id: item.product.id,
            quantity: item.qty,
          })),
        }),
      })
      if (res.ok) {
        setCart([])
        setShowCart(false)
        fetchOrders()
        showToast('🎉 Order placed successfully!', 'success')
      }
    } catch (err) {
      showToast('❌ Failed to place order', 'error')
    }
  }

  // Filter products by search
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="shop-page">
      <div className="container">
        {/* Header */}
        <div className="shop-header">
          <div>
            <h1>🛒 Fresh Market</h1>
            <p>Browse farm-fresh produce from local farmers</p>
          </div>
          <div className="shop-actions">
            <button
              className="orders-btn"
              onClick={() => setShowOrders(!showOrders)}
            >
              📋 My Orders {orders.length > 0 && `(${orders.length})`}
            </button>
            <button
              className="cart-btn"
              onClick={() => setShowCart(!showCart)}
            >
              🛒 Cart
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search for vegetables, fruits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Orders Panel */}
        {showOrders && (
          <div className="orders-panel">
            <h2>📋 Your Orders</h2>
            {orders.length === 0 ? (
              <p className="orders-empty">No orders yet. Start shopping!</p>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <span className="order-id">
                        Order #{order.id.slice(0, 8)}
                      </span>
                      <span className="order-status">✅ {order.status}</span>
                    </div>
                    <div className="order-items">
                      {order.items.map((item, i) => (
                        <span key={i} className="order-item">
                          {item.product_name} × {item.quantity} — ₹
                          {item.subtotal}
                        </span>
                      ))}
                    </div>
                    <div className="order-total">
                      Total: <strong>₹{order.total}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cart Sidebar */}
        {showCart && (
          <div className="cart-overlay" onClick={() => setShowCart(false)}>
            <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
              <div className="cart-header">
                <h2>🛒 Your Cart</h2>
                <button
                  className="cart-close"
                  onClick={() => setShowCart(false)}
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="cart-empty">
                  <span>🛒</span>
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.map((item) => (
                      <div key={item.product.id} className="cart-item">
                        <span className="cart-item-emoji">
                          {getEmoji(item.product.name)}
                        </span>
                        <div className="cart-item-info">
                          <span className="cart-item-name">
                            {item.product.name}
                          </span>
                          <span className="cart-item-price">
                            ₹{item.product.price} × {item.qty}
                          </span>
                        </div>
                        <div className="cart-item-controls">
                          <button onClick={() => updateQty(item.product.id, -1)}>
                            −
                          </button>
                          <span>{item.qty}</span>
                          <button onClick={() => updateQty(item.product.id, 1)}>
                            +
                          </button>
                        </div>
                        <button
                          className="cart-item-remove"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="cart-footer">
                    <div className="cart-total">
                      <span>Total</span>
                      <span className="cart-total-price">
                        ₹{cartTotal.toFixed(2)}
                      </span>
                    </div>
                    <button className="checkout-btn" onClick={placeOrder}>
                      🎉 Place Order
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-emoji">🌾</span>
            <p>
              {search
                ? 'No products match your search.'
                : 'No products available yet. Check back soon!'}
            </p>
          </div>
        ) : (
          <div className="product-grid shop-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card shop-product-card">
                <div className="product-emoji">{getEmoji(product.name)}</div>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-qty">{product.quantity}</p>
                <p className="product-farmer">by {product.farmer}</p>
                <p className="product-price">₹{product.price}</p>
                <button
                  className="add-to-cart-btn"
                  onClick={() => addToCart(product)}
                >
                  🛒 Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}

export default CustomerShop
