from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'mooki-store-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class ProductBase(BaseModel):
    name: str = "Strawberry Punch"
    flavor: str = "Strawberry Punch"
    nicotine_strength: str = "5%"
    price: float = 29.99
    stock: int = 100
    is_available: bool = True
    image_url: str = "https://customer-assets.emergentagent.com/job_mooki-single-vape/artifacts/534ct6rv_shisha.jpg"
    description: str = "Premium vape with refreshing strawberry punch flavor"

class Product(ProductBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    flavor: Optional[str] = None
    nicotine_strength: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    is_available: Optional[bool] = None
    image_url: Optional[str] = None
    description: Optional[str] = None

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float

class OrderCreate(BaseModel):
    customer_name: str
    phone: str
    address: str
    email: Optional[str] = None
    items: List[OrderItem]
    total: float
    payment_method: str = "Cash on Delivery"

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    phone: str
    address: str
    email: Optional[str] = None
    items: List[OrderItem]
    total: float
    payment_method: str = "Cash on Delivery"
    status: str = "Pending"  # Pending, Confirmed, Completed, Cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderStatusUpdate(BaseModel):
    status: str

class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_read: bool = False

class ContactMessageCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    message: str

class AdminUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class EmailRequest(BaseModel):
    recipient_email: EmailStr
    subject: str
    html_content: str

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== STARTUP ====================

@app.on_event("startup")
async def startup_event():
    # Initialize default product if not exists
    existing_product = await db.products.find_one({}, {"_id": 0})
    if not existing_product:
        product = Product()
        doc = product.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.products.insert_one(doc)
        logger.info("Default product created")
    
    # Initialize default admin if not exists
    existing_admin = await db.admins.find_one({}, {"_id": 0})
    if not existing_admin:
        admin = AdminUser(
            username="admin",
            password_hash=hash_password("admin123")
        )
        doc = admin.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.admins.insert_one(doc)
        logger.info("Default admin created (username: admin, password: admin123)")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# ==================== PRODUCT ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "MOOKI STORE API"}

@api_router.get("/products", response_model=List[Product])
async def get_all_products():
    products = await db.products.find({}, {"_id": 0}).to_list(100)
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
        if isinstance(product.get('updated_at'), str):
            product['updated_at'] = datetime.fromisoformat(product['updated_at'])
    return products

@api_router.get("/product", response_model=Product)
async def get_product():
    # Get the first/featured product for backward compatibility
    product = await db.products.find_one({}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    if isinstance(product.get('updated_at'), str):
        product['updated_at'] = datetime.fromisoformat(product['updated_at'])
    return product

@api_router.get("/product/{product_id}", response_model=Product)
async def get_product_by_id(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    if isinstance(product.get('updated_at'), str):
        product['updated_at'] = datetime.fromisoformat(product['updated_at'])
    return product

@api_router.post("/product", response_model=Product)
async def create_product(product_data: ProductBase, admin: str = Depends(verify_token)):
    product = Product(**product_data.model_dump())
    doc = product.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.products.insert_one(doc)
    return product

@api_router.put("/product/{product_id}", response_model=Product)
async def update_product(product_id: str, update: ProductUpdate, admin: str = Depends(verify_token)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.products.update_one({"id": product_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return await get_product_by_id(product_id)

@api_router.put("/product", response_model=Product)
async def update_first_product(update: ProductUpdate, admin: str = Depends(verify_token)):
    # Update first product for backward compatibility
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.products.update_one({}, {"$set": update_data})
    return await get_product()

@api_router.delete("/product/{product_id}")
async def delete_product(product_id: str, admin: str = Depends(verify_token)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# ==================== ORDER ENDPOINTS ====================

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate):
    # Check product availability and stock for each item
    for item in order_data.items:
        product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
        if not product or not product.get('is_available'):
            raise HTTPException(status_code=400, detail=f"Product {item.product_name} not available")
        if product.get('stock', 0) < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {item.product_name}")
    
    order = Order(**order_data.model_dump())
    doc = order.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.orders.insert_one(doc)
    
    # Update stock for each item
    for item in order_data.items:
        await db.products.update_one(
            {"id": item.product_id},
            {"$inc": {"stock": -item.quantity}}
        )
    
    # Send confirmation email if email provided
    if order_data.email:
        try:
            await send_order_confirmation_email(order, order_data.email)
        except Exception as e:
            logger.error(f"Failed to send confirmation email: {e}")
    
    return order

@api_router.get("/orders", response_model=List[Order])
async def get_orders(admin: str = Depends(verify_token)):
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
        if isinstance(order.get('updated_at'), str):
            order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if isinstance(order.get('created_at'), str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    if isinstance(order.get('updated_at'), str):
        order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    return order

@api_router.put("/orders/{order_id}/status", response_model=Order)
async def update_order_status(order_id: str, status_update: OrderStatusUpdate, admin: str = Depends(verify_token)):
    valid_statuses = ["Pending", "Confirmed", "Completed", "Cancelled"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status_update.status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return await get_order(order_id)

# ==================== CONTACT ENDPOINTS ====================

@api_router.post("/contact", response_model=ContactMessage)
async def create_contact_message(message_data: ContactMessageCreate):
    message = ContactMessage(**message_data.model_dump())
    doc = message.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.contact_messages.insert_one(doc)
    return message

@api_router.get("/contact", response_model=List[ContactMessage])
async def get_contact_messages(admin: str = Depends(verify_token)):
    messages = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for msg in messages:
        if isinstance(msg.get('created_at'), str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
    return messages

@api_router.put("/contact/{message_id}/read")
async def mark_message_read(message_id: str, admin: str = Depends(verify_token)):
    result = await db.contact_messages.update_one(
        {"id": message_id},
        {"$set": {"is_read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Marked as read"}

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/login", response_model=TokenResponse)
async def admin_login(login_data: AdminLogin):
    admin = await db.admins.find_one({"username": login_data.username}, {"_id": 0})
    if not admin or not verify_password(login_data.password, admin['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": admin['username']})
    return TokenResponse(access_token=token)

@api_router.get("/auth/verify")
async def verify_admin(admin: str = Depends(verify_token)):
    return {"valid": True, "username": admin}

# ==================== EMAIL SERVICE ====================

async def send_order_confirmation_email(order: Order, recipient_email: str):
    try:
        import resend
        
        resend_api_key = os.environ.get('RESEND_API_KEY')
        sender_email = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
        
        if not resend_api_key:
            logger.warning("RESEND_API_KEY not configured, skipping email")
            return
        
        resend.api_key = resend_api_key
        
        items_html = "".join([
            f"<tr><td style='padding: 8px; border-bottom: 1px solid #262626;'>{item.product_name}</td>"
            f"<td style='padding: 8px; border-bottom: 1px solid #262626;'>{item.quantity}</td>"
            f"<td style='padding: 8px; border-bottom: 1px solid #262626;'>${item.price:.2f}</td></tr>"
            for item in order.items
        ])
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #EDEDED; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://customer-assets.emergentagent.com/job_mooki-single-vape/artifacts/yq4n0bz1_logo.jpg" alt="MOOKI STORE" style="width: 80px; height: 80px; border-radius: 8px;">
                <h1 style="color: #FF4500; margin: 10px 0;">MOOKI STORE</h1>
            </div>
            <h2 style="color: #FF4500;">Order Confirmation</h2>
            <p>Thank you for your order, {order.customer_name}!</p>
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Payment Method:</strong> {order.payment_method}</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr style="background: #121212;">
                        <th style="padding: 8px; text-align: left;">Product</th>
                        <th style="padding: 8px; text-align: left;">Qty</th>
                        <th style="padding: 8px; text-align: left;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    {items_html}
                </tbody>
            </table>
            
            <p style="font-size: 18px;"><strong>Total: <span style="color: #FF4500;">${order.total:.2f}</span></strong></p>
            
            <div style="background: #121212; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <h3 style="margin-top: 0;">Delivery Address</h3>
                <p>{order.address}</p>
                <p>Phone: {order.phone}</p>
            </div>
            
            <p style="color: #A1A1AA; font-size: 12px; margin-top: 20px;">
                This product is intended for adults 18+ only.
            </p>
        </div>
        """
        
        params = {
            "from": sender_email,
            "to": [recipient_email],
            "subject": f"MOOKI STORE - Order Confirmation #{order.id[:8]}",
            "html": html_content
        }
        
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Order confirmation email sent to {recipient_email}")
        
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        raise

@api_router.post("/send-test-email")
async def send_test_email(request: EmailRequest, admin: str = Depends(verify_token)):
    try:
        import resend
        
        resend_api_key = os.environ.get('RESEND_API_KEY')
        sender_email = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
        
        if not resend_api_key:
            raise HTTPException(status_code=500, detail="RESEND_API_KEY not configured")
        
        resend.api_key = resend_api_key
        
        params = {
            "from": sender_email,
            "to": [request.recipient_email],
            "subject": request.subject,
            "html": request.html_content
        }
        
        email = await asyncio.to_thread(resend.Emails.send, params)
        return {"status": "success", "email_id": email.get("id")}
        
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
