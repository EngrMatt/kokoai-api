from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID

class CategoryBase(BaseModel):
    name: str
    type: str  # INCOME or EXPENSE
    icon_type: Optional[str] = None
    color: Optional[str] = None
    is_active: bool = True
    parent_id: Optional[UUID] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon_type: Optional[str] = None
    is_active: Optional[bool] = None
    parent_id: Optional[UUID] = None

class CategoryResponse(CategoryBase):
    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True

class CategoryWithChildren(CategoryResponse):
    children: List["CategoryWithChildren"] = []
