import { useState, useEffect } from 'react'
import './FarmerDashboard.css'

const API = 'http://127.0.0.1:8000/api'

// Some emoji icons for product categories
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
  FarmerDashboard — where farmers add & manage their products.
*/
function FarmerDashboard({ user }) {
  const [products, setProducts] = useState([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [toast, setToast] = useState(null)
  const [isAdding, setIsAdding] = useState(false)

  // Fetch farmer's products on load
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/products/${user.username}`)
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error('Failed to fetch products:', err)
    }
  }

  const showToast = (msg, type = '') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!name || !price || !quantity) return

    setIsAdding(true)
    try {
      const res = await fetch(`${API}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          price: parseFloat(price),
          quantity,
          farmer: user.username,
        }),
      })
      if (res.ok) {
        setName('')
        setPrice('')
        setQuantity('')
        fetchProducts()
        showToast('✅ Product added successfully!', 'success')
      }
    } catch (err) {
      showToast('❌ Failed to add product', 'error')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (productId) => {
    try {
      await fetch(`${API}/products/${productId}`, { method: 'DELETE' })
      fetchProducts()
      showToast('🗑️ Product removed', '')
    } catch (err) {
      showToast('❌ Failed to delete', 'error')
    }
  }

  return (
    <div className="farmer-page">
      <div className="container">
        {/* Page Header */}
        <div className="farmer-header">
          <div>
            <h1>🧑‍🌾 Your Farm Store</h1>
            <p>Add your fresh produce and set prices for customers.</p>
          </div>
          <div className="farmer-stats">
            <div className="stat-card">
              <span className="stat-number">{products.length}</span>
              <span className="stat-label">Products Listed</span>
            </div>
          </div>
        </div>

        {/* Add Product Form */}
        <div className="farmer-form-card">
          <h2>➕ Add New Product</h2>
          <form onSubmit={handleAddProduct} className="farmer-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="product-name">Product Name</label>
                <input
                  id="product-name"
                  type="text"
                  placeholder="e.g. Carrots, Tomatoes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="product-price">Price (₹)</label>
                <input
                  id="product-price"
                  type="number"
                  placeholder="e.g. 40"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="product-quantity">Quantity</label>
                <input
                  id="product-quantity"
                  type="text"
                  placeholder="e.g. 1 kg, 500 g"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="add-btn" disabled={isAdding}>
              {isAdding ? '⏳ Adding...' : '🌱 Add Product'}
            </button>
          </form>
        </div>

        {/* Product List */}
        <div className="farmer-products-section">
          <h2>📦 Your Products</h2>
          {products.length === 0 ? (
            <div className="empty-state">
              <span className="empty-emoji">🌱</span>
              <p>No products yet. Add your first product above!</p>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card farmer-product-card">
                  <div className="product-emoji">{getEmoji(product.name)}</div>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-qty">{product.quantity}</p>
                  <p className="product-price">₹{product.price}</p>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(product.id)}
                  >
                    🗑️ Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}

export default FarmerDashboard
