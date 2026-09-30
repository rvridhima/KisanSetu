"""
KisanSetu Backend — FastAPI with SQLite Database
A simple farmer-to-customer marketplace API using SQLite persistence.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import uuid
import os

# ──────────────────────────────────────────────
# App Setup
# ──────────────────────────────────────────────
app = FastAPI(title="KisanSetu API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = os.path.join(os.path.dirname(__file__), "kisansetu.db")

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Create Users Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    """)
    
    # Create Products Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            quantity TEXT NOT NULL,
            farmer TEXT NOT NULL,
            image_url TEXT
        )
    """)
    
    # Create Orders Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            customer TEXT NOT NULL,
            total REAL NOT NULL,
            status TEXT NOT NULL
        )
    """)
    
    # Create Order Items Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            product_name TEXT NOT NULL,
            price REAL NOT NULL,
            quantity INTEGER NOT NULL,
            subtotal REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders (id)
        )
    """)
    
    conn.commit()
    conn.close()

# Initialize DB tables on startup
init_db()

# ──────────────────────────────────────────────
# Pydantic Models (request/response shapes)
# ──────────────────────────────────────────────
class UserSignup(BaseModel):
    username: str
    password: str
    role: str           # "farmer" or "customer"

class UserLogin(BaseModel):
    username: str
    password: str

class Product(BaseModel):
    name: str
    price: float
    quantity: str       # e.g. "1 kg", "500 g"
    farmer: str         # username of the farmer
    image_url: Optional[str] = ""

class CartItem(BaseModel):
    product_id: str
    quantity: int

class OrderRequest(BaseModel):
    customer: str
    items: List[CartItem]

# ──────────────────────────────────────────────
# Auth Routes
# ──────────────────────────────────────────────
@app.post("/api/signup")
def signup(user: UserSignup):
    """Register a new farmer or customer."""
    if user.role not in ["farmer", "customer"]:
        raise HTTPException(status_code=400, detail="Role must be 'farmer' or 'customer'")
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if username exists
    cursor.execute("SELECT username FROM users WHERE username = ?", (user.username,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Username already exists")
    
    cursor.execute(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
        (user.username, user.password, user.role)
    )
    conn.commit()
    conn.close()
    return {"message": "Account created successfully!", "role": user.role}


@app.post("/api/login")
def login(user: UserLogin):
    """Log in and get back the user's role."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT password, role FROM users WHERE username = ?", (user.username,))
    row = cursor.fetchone()
    conn.close()
    
    if not row or row["password"] != user.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
        
    return {
        "message": "Login successful!",
        "username": user.username,
        "role": row["role"],
    }

# ──────────────────────────────────────────────
# Product Routes
# ──────────────────────────────────────────────
@app.get("/api/products")
def get_products():
    """Return every product in the store from any farmer."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, price, quantity, farmer, image_url FROM products")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


@app.get("/api/products/{farmer}")
def get_farmer_products(farmer: str):
    """Return only the products listed by a specific farmer."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, price, quantity, farmer, image_url FROM products WHERE farmer = ?", (farmer,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


@app.post("/api/products")
def add_product(product: Product):
    """Farmer adds a new product for sale."""
    product_id = str(uuid.uuid4())
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO products (id, name, price, quantity, farmer, image_url) VALUES (?, ?, ?, ?, ?, ?)",
        (product_id, product.name, product.price, product.quantity, product.farmer, product.image_url or "")
    )
    conn.commit()
    conn.close()
    
    new_product = product.dict()
    new_product["id"] = product_id
    return {"message": "Product added!", "product": new_product}


@app.delete("/api/products/{product_id}")
def delete_product(product_id: str):
    """Farmer removes one of their products."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
    deleted = cursor.rowcount
    conn.commit()
    conn.close()
    
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted!"}

# ──────────────────────────────────────────────
# Order Routes
# ──────────────────────────────────────────────
@app.post("/api/orders")
def place_order(order: OrderRequest):
    """Customer places an order."""
    conn = get_db()
    cursor = conn.cursor()
    
    order_items = []
    total = 0.0
    
    for item in order.items:
        cursor.execute("SELECT name, price FROM products WHERE id = ?", (item.product_id,))
        prod = cursor.fetchone()
        if not prod:
            conn.close()
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        subtotal = prod["price"] * item.quantity
        total += subtotal
        order_items.append({
            "product_name": prod["name"],
            "price": prod["price"],
            "quantity": item.quantity,
            "subtotal": subtotal,
        })

    order_id = str(uuid.uuid4())
    round_total = round(total, 2)
    
    # Save Order
    cursor.execute(
        "INSERT INTO orders (id, customer, total, status) VALUES (?, ?, ?, ?)",
        (order_id, order.customer, round_total, "placed")
    )
    
    # Save Order Items
    for item in order_items:
        cursor.execute(
            """INSERT INTO order_items (order_id, product_name, price, quantity, subtotal) 
               VALUES (?, ?, ?, ?, ?)""",
            (order_id, item["product_name"], item["price"], item["quantity"], item["subtotal"])
        )
        
    conn.commit()
    conn.close()
    
    new_order = {
        "id": order_id,
        "customer": order.customer,
        "items": order_items,
        "total": round_total,
        "status": "placed",
    }
    return {"message": "Order placed successfully!", "order": new_order}


@app.get("/api/orders/{customer}")
def get_orders(customer: str):
    """Get all orders for a customer."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, customer, total, status FROM orders WHERE customer = ?", (customer,))
    orders_rows = cursor.fetchall()
    
    orders = []
    for o_row in orders_rows:
        order_dict = dict(o_row)
        cursor.execute("SELECT product_name, price, quantity, subtotal FROM order_items WHERE order_id = ?", (order_dict["id"],))
        items_rows = cursor.fetchall()
        order_dict["items"] = [dict(i_row) for i_row in items_rows]
        orders.append(order_dict)
        
    conn.close()
    return orders

# ──────────────────────────────────────────────
# Run server
# ──────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
