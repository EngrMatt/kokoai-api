# app/repositories/user_repository.py
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user_schema import UserCreate
import uuid

class UserRepository:
    def get_by_id(self, db: Session, user_id: uuid.UUID):
        return db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, db: Session, email: str):
        return db.query(User).filter(User.email == email).first()

    def create(self, db: Session, user_in: UserCreate, hashed_password: str):
        db_user = User(
            full_name=user_in.full_name,
            email=user_in.email,
            hashed_password=hashed_password,  # 存入加密後的密碼
            is_active=True,
            is_superuser=False
        )
        db.add(db_user)
        db.commit()      
        db.refresh(db_user)
        return db_user