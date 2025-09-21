from sqlalchemy import Column, Integer, String, DateTime, func
from db import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(160), unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())