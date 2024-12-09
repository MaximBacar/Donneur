from sqlalchemy import Column, Integer, String, Double, Date, DateTime
from ..base import Base

class Sender(Base):
    __tablename__ = 'senders'
    id              = Column(Integer,   primary_key=True, autoincrement=True)