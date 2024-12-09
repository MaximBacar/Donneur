from sqlalchemy import Column, Integer, String, Double, Date, DateTime
from ..base import Base

class Transaction(Base):
    __tablename__ = 'transactions'
    id              = Column(Integer,   primary_key=True, autoincrement=True)