from sqlalchemy import Column, Integer, String, Double, Date, DateTime
from ..base import Base

class Organization(Base):
    __tablename__ = 'organizations'
    id              = Column(Integer,   primary_key=True, autoincrement=True)