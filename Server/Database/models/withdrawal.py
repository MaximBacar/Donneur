from sqlalchemy import Column, Integer, String, Double, Date, DateTime
from ..base import Base

class Withdrawal(Base):
    __tablename__ = 'withdrawals'
    id              = Column(Integer,   primary_key=True, autoincrement=True)