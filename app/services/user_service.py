# app/services/user_service.py
from sqlalchemy.orm import Session
import uuid
from app.schemas.user_schema import UserCreate
from app.repositories.user_repository import UserRepository
from app.core.security import hash_password  # 確保你有這個 function
from fastapi import HTTPException

class UserService:
    def __init__(self):
        self.user_repo = UserRepository()

    def create_user(self, db: Session, user_in: UserCreate):
        # 1. 邏輯處理：檢查 Email 是否重複 (這很重要！)
        existing_user = self.user_repo.get_by_email(db, email=user_in.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # 2. 密碼加密
        hashed_pw = hash_password(user_in.password)
        
        # 3. 傳給 Repository 執行寫入
        return self.user_repo.create(db, user_in=user_in, hashed_password=hashed_pw)

    def get_user(self, db: Session, user_id: uuid.UUID):
        return self.user_repo.get_by_id(db, user_id)