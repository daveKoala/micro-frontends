import os
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager

from app.routes.catalogue import router as catalogue_router

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/catalogue")
BASE_PATH = os.getenv("BASE_PATH", "/catalogue")

# Database connection
db_client = None
db = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_client, db
    db_client = AsyncIOMotorClient(MONGODB_URI)
    db = db_client.get_database()
    print(f"Connected to MongoDB: {MONGODB_URI}")

    # Seed some sample data if collection is empty
    count = await db.products.count_documents({})
    if count == 0:
        await seed_data()

    yield

    db_client.close()
    print("Disconnected from MongoDB")


async def seed_data():
    """Seed initial product data"""
    products = [
        {
            "name": "Laptop Pro",
            "description": "High-performance laptop for professionals",
            "price": 1299.99,
            "category": "electronics",
            "stock": 50,
            "image": "https://via.placeholder.com/300x200"
        },
        {
            "name": "Wireless Headphones",
            "description": "Premium noise-canceling headphones",
            "price": 299.99,
            "category": "electronics",
            "stock": 100,
            "image": "https://via.placeholder.com/300x200"
        },
        {
            "name": "Office Chair",
            "description": "Ergonomic office chair with lumbar support",
            "price": 449.99,
            "category": "furniture",
            "stock": 25,
            "image": "https://via.placeholder.com/300x200"
        },
        {
            "name": "Standing Desk",
            "description": "Electric height-adjustable standing desk",
            "price": 599.99,
            "category": "furniture",
            "stock": 15,
            "image": "https://via.placeholder.com/300x200"
        },
        {
            "name": "Mechanical Keyboard",
            "description": "RGB mechanical keyboard with Cherry MX switches",
            "price": 149.99,
            "category": "electronics",
            "stock": 75,
            "image": "https://via.placeholder.com/300x200"
        }
    ]
    await db.products.insert_many(products)
    print("Seeded initial product data")


app = FastAPI(
    title="Catalogue Service",
    lifespan=lifespan,
    root_path=BASE_PATH
)

# Mount static files
app.mount(
    "/static",
    StaticFiles(directory="app/static"),
    name="static"
)

# Templates
templates = Jinja2Templates(directory="app/templates")


@app.middleware("http")
async def add_base_path(request: Request, call_next):
    request.state.base_path = BASE_PATH
    request.state.db = db
    response = await call_next(request)
    return response


# Include routes
app.include_router(catalogue_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "catalogue"}
