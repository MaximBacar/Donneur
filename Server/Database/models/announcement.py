from sqlalchemy import Column, Integer, String, Double, Date, DateTime
from ..base import Base

class Announcement(Base):
    __tablename__ = 'announcements'
    id              = Column(Integer,   primary_key=True, autoincrement=True)