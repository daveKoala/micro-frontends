from pydantic import BaseModel, Field
from typing import Optional


class ProductBase(BaseModel):
    name: str
    description: str
    price: float = Field(gt=0)
    category: str
    stock: int = Field(ge=0)
    image: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    image: Optional[str] = None


class Product(ProductBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
