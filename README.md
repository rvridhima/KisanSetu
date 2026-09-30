# 🌾 KisanSetu — Farm Fresh, Directly to You

A full-stack web application that connects **farmers** directly with **customers** — no middlemen, fair prices!

Built with **React** (frontend) and **Python FastAPI** (backend).

---

## 📸 Features

- 🔐 **Login / Signup** — register as a Farmer or Customer
- 🧑‍🌾 **Farmer Dashboard** — add products, set prices, manage listings
- 🛒 **Customer Shop** — browse products, add to cart, place orders
- 📋 **Order History** — customers can view their past orders
- 🔍 **Search** — quickly find products
- 🎨 **Beautiful UI** — modern, responsive design with animations

---

## 🛠️ Tech Stack

| Layer    | Technology       |
|----------|-----------------|
| Frontend | React + Vite    |
| Styling  | Vanilla CSS     |
| Backend  | Python + FastAPI |
| Database | SQLite (`kisansetu.db`) |

---

## 🚀 How to Run

### 1. Start the Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The API will run at **http://127.0.0.1:8000**

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will run at **http://localhost:5173**

---

## 📂 Project Structure

```
KisanSetu/
├── README.md
├── .gitignore
├── backend/
│   ├── main.py              # FastAPI server (all routes)
│   └── requirements.txt     # Python dependencies
└── frontend/
    ├── index.html            # HTML entry point
    ├── vite.config.js        # Vite configuration
    ├── package.json          # Node dependencies
    └── src/
        ├── main.jsx          # React entry point
        ├── index.css         # Global styles (design system)
        ├── App.jsx           # Root component (routing)
        ├── App.css           # App-level styles
        └── components/
            ├── Login.jsx          # Login / Signup page
            ├── Login.css
            ├── Navbar.jsx         # Top navigation bar
            ├── Navbar.css
            ├── FarmerDashboard.jsx # Farmer product management
            ├── FarmerDashboard.css
            ├── CustomerShop.jsx   # Customer shopping page
            └── CustomerShop.css
```

---

## 📝 API Endpoints

| Method | Endpoint                  | Description              |
|--------|--------------------------|--------------------------|
| POST   | `/api/signup`            | Register a new user      |
| POST   | `/api/login`             | Login                    |
| GET    | `/api/products`          | Get all products         |
| GET    | `/api/products/{farmer}` | Get farmer's products    |
| POST   | `/api/products`          | Add a product (farmer)   |
| DELETE | `/api/products/{id}`     | Delete a product         |
| POST   | `/api/orders`            | Place an order           |
| GET    | `/api/orders/{customer}` | Get customer's orders    |

---