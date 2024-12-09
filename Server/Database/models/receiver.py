from sqlalchemy import Column, Integer, String, Double, Date, DateTime
from ..base import Base

class Receiver(Base):
    __tablename__ = 'receivers'
    id              = Column(Integer,   primary_key=True, autoincrement=True)
    last_name       = Column(String)
    first_name      = Column(String)
    uuid            = Column(String)
    id_picture      = Column(String)
    balance         = Column(Double)

    email           = Column(String)
    phone           = Column(String)

    dob             = Column(Date)
    creation_time   = Column(DateTime)