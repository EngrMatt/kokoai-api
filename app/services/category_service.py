from sqlalchemy.orm import Session
from app.models.category import Category
from uuid import UUID
import uuid

DEFAULT_EXPENSE_CATEGORIES = [
    {"name": "飲食", "icon": "Utensils", "type": "EXPENSE", "sub": [
        {"name": "早餐", "icon": "Coffee"},
        {"name": "午餐", "icon": "Utensils"},
        {"name": "晚餐", "icon": "UtensilsCrossed"},
        {"name": "點心", "icon": "Cookie"},
        {"name": "飲料", "icon": "Cup"},
    ]},
    {"name": "娛樂", "icon": "Gamepad2", "type": "EXPENSE"},
    {"name": "購物", "icon": "ShoppingBag", "type": "EXPENSE"},
    {"name": "交通", "icon": "Bus", "type": "EXPENSE"},
    {"name": "醫療", "icon": "Heart", "type": "EXPENSE"},
    {"name": "居家", "icon": "Home", "type": "EXPENSE"},
]

DEFAULT_INCOME_CATEGORIES = [
    {"name": "薪資", "icon": "Wallet", "type": "INCOME"},
    {"name": "獎金", "icon": "Gift", "type": "INCOME"},
    {"name": "投資", "icon": "TrendingUp", "type": "INCOME"},
    {"name": "其他收入", "icon": "Plus", "type": "INCOME"},
]

def init_user_categories(db: Session, user_id: UUID):
    """
    Initialize default categories for a new user.
    """
    # Initialize Expenses
    for cat_data in DEFAULT_EXPENSE_CATEGORIES:
        parent = Category(
            id=uuid.uuid4(),
            name=cat_data["name"],
            icon_type=cat_data["icon"],
            type=cat_data["type"],
            user_id=user_id
        )
        db.add(parent)
        
        # Add subcategories if any
        if "sub" in cat_data:
            for sub_data in cat_data["sub"]:
                child = Category(
                    id=uuid.uuid4(),
                    name=sub_data["name"],
                    icon_type=sub_data["icon"],
                    type=cat_data["type"],
                    user_id=user_id,
                    parent_id=parent.id
                )
                db.add(child)

    # Initialize Incomes
    for cat_data in DEFAULT_INCOME_CATEGORIES:
        db.add(Category(
            id=uuid.uuid4(),
            name=cat_data["name"],
            icon_type=cat_data["icon"],
            type=cat_data["type"],
            user_id=user_id
        ))
    
    db.commit()
