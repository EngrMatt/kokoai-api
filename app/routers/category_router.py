from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.models.category import Category
from app.models.user import User
from app.schemas.category_schema import CategoryCreate, CategoryUpdate, CategoryResponse
from app.routers.deps import get_current_user
from uuid import UUID

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=List[CategoryResponse])
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Category).filter(Category.user_id == current_user.id, Category.is_active == True).all()

@router.post("/", response_model=CategoryResponse)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_cat = Category(
        **category_in.model_dump(),
        user_id=current_user.id
    )
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: UUID,
    category_in: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cat = db.query(Category).filter(Category.id == category_id, Category.user_id == current_user.id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = category_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(cat, field, value)
    
    db.commit()
    db.refresh(cat)
    return cat

@router.delete("/{category_id}")
def delete_category(
    category_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cat = db.query(Category).filter(Category.id == category_id, Category.user_id == current_user.id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Soft delete
    cat.is_active = False
    db.commit()
    return {"message": "Category deleted"}
