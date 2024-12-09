from sqlalchemy import Column, Integer, String, Double, Date, DateTime
from ..base import Base

class Occupancy(Base):
    __tablename__ = 'occupancies'
    id              = Column(Integer,   primary_key=True, autoincrement=True)