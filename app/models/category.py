from sqlalchemy import Column, String, ForeignKey, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.db.base import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # INCOME or EXPENSE
    icon_type = Column(String, nullable=True)
    color = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Self-referencing relationship for parent-child (Sub-categories)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Relationships
    user = relationship("User")
    parent = relationship("Category", remote_side=[id], backref="children")
    transactions = relationship("TransactionRecord", back_populates="category")
