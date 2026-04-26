from sqlalchemy.orm import Session
from app.models.category import Category
from uuid import UUID
import uuid

DEFAULT_EXPENSE_CATEGORIES = [
    {"name": "飲食", "icon": "Utensils", "color": "#5B9BD5", "type": "EXPENSE", "sub": [
        {"name": "早餐", "icon": "Coffee", "color": "#5B9BD5"},
        {"name": "午餐", "icon": "Utensils", "color": "#5B9BD5"},
        {"name": "晚餐", "icon": "UtensilsCrossed", "color": "#5B9BD5"},
        {"name": "點心", "icon": "Cookie", "color": "#5B9BD5"},
        {"name": "飲料", "icon": "Cup", "color": "#5B9BD5"},
    ]},
    {"name": "娛樂", "icon": "Gamepad2", "color": "#F4A460", "type": "EXPENSE"},
    {"name": "購物", "icon": "ShoppingBag", "color": "#DDA0DD", "type": "EXPENSE"},
    {"name": "交通", "icon": "Bus", "color": "#90EE90", "type": "EXPENSE"},
    {"name": "醫療", "icon": "Heart", "color": "#20B2AA", "type": "EXPENSE"},
    {"name": "居家", "icon": "Home", "color": "#6495ED", "type": "EXPENSE"},
]

DEFAULT_INCOME_CATEGORIES = [
    {"name": "薪資", "icon": "Wallet", "color": "#4CAF50", "type": "INCOME"},
    {"name": "獎金", "icon": "Gift", "color": "#8BC34A", "type": "INCOME"},
    {"name": "投資", "icon": "TrendingUp", "color": "#00BCD4", "type": "INCOME"},
    {"name": "其他收入", "icon": "Plus", "color": "#9E9E9E", "type": "INCOME"},
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
            color=cat_data.get("color"),
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
                    color=sub_data.get("color"),
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
            color=cat_data.get("color"),
            type=cat_data["type"],
            user_id=user_id
        ))
    
    db.commit()
