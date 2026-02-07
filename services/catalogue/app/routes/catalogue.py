from fastapi import APIRouter, Request, Form, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from bson import ObjectId
from typing import Optional

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")


def serialize_product(product):
    """Convert MongoDB document to dict with string ID"""
    if product:
        product["_id"] = str(product["_id"])
    return product


@router.get("/", response_class=HTMLResponse)
async def list_products(request: Request, category: Optional[str] = None):
    """List all products"""
    db = request.state.db
    base_path = request.state.base_path

    query = {}
    if category:
        query["category"] = category

    cursor = db.products.find(query)
    products = await cursor.to_list(length=100)
    products = [serialize_product(p) for p in products]

    # Get unique categories
    categories = await db.products.distinct("category")

    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "products": products,
            "categories": categories,
            "current_category": category,
            "base_path": base_path,
            "title": "Product Catalogue"
        }
    )


@router.get("/product/{product_id}", response_class=HTMLResponse)
async def get_product(request: Request, product_id: str):
    """Get single product details"""
    db = request.state.db
    base_path = request.state.base_path

    try:
        product = await db.products.find_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Product not found")

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product = serialize_product(product)

    return templates.TemplateResponse(
        "product.html",
        {
            "request": request,
            "product": product,
            "base_path": base_path,
            "title": product["name"]
        }
    )


@router.get("/new", response_class=HTMLResponse)
async def new_product_form(request: Request):
    """Show new product form"""
    base_path = request.state.base_path

    return templates.TemplateResponse(
        "product_form.html",
        {
            "request": request,
            "product": None,
            "base_path": base_path,
            "title": "Add Product",
            "action": "create"
        }
    )


@router.post("/")
async def create_product(
    request: Request,
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category: str = Form(...),
    stock: int = Form(...),
    image: str = Form("")
):
    """Create new product"""
    db = request.state.db
    base_path = request.state.base_path

    product = {
        "name": name,
        "description": description,
        "price": price,
        "category": category,
        "stock": stock,
        "image": image or "https://via.placeholder.com/300x200"
    }

    await db.products.insert_one(product)
    return RedirectResponse(url=base_path, status_code=303)


@router.get("/product/{product_id}/edit", response_class=HTMLResponse)
async def edit_product_form(request: Request, product_id: str):
    """Show edit product form"""
    db = request.state.db
    base_path = request.state.base_path

    try:
        product = await db.products.find_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Product not found")

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product = serialize_product(product)

    return templates.TemplateResponse(
        "product_form.html",
        {
            "request": request,
            "product": product,
            "base_path": base_path,
            "title": f"Edit {product['name']}",
            "action": "edit"
        }
    )


@router.post("/product/{product_id}")
async def update_product(
    request: Request,
    product_id: str,
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category: str = Form(...),
    stock: int = Form(...),
    image: str = Form("")
):
    """Update product"""
    db = request.state.db
    base_path = request.state.base_path

    await db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": {
            "name": name,
            "description": description,
            "price": price,
            "category": category,
            "stock": stock,
            "image": image or "https://via.placeholder.com/300x200"
        }}
    )

    return RedirectResponse(url=f"{base_path}/product/{product_id}", status_code=303)


@router.post("/product/{product_id}/delete")
async def delete_product(request: Request, product_id: str):
    """Delete product"""
    db = request.state.db
    base_path = request.state.base_path

    await db.products.delete_one({"_id": ObjectId(product_id)})
    return RedirectResponse(url=base_path, status_code=303)


# API endpoints
@router.get("/api/products")
async def api_list_products(request: Request, category: Optional[str] = None):
    """API: List all products"""
    db = request.state.db

    query = {}
    if category:
        query["category"] = category

    cursor = db.products.find(query)
    products = await cursor.to_list(length=100)
    return [serialize_product(p) for p in products]


@router.get("/api/products/{product_id}")
async def api_get_product(request: Request, product_id: str):
    """API: Get single product"""
    db = request.state.db

    try:
        product = await db.products.find_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Product not found")

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return serialize_product(product)
