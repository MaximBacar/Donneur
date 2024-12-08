from sqlalchemy     import create_engine,       Column,         Integer,        String, Double, DateTime, Boolean, func
from sqlalchemy.orm import declarative_base,    sessionmaker,   scoped_session
import datetime

engine = create_engine('sqlite:///donneur.db', pool_size=20, max_overflow=0)
Session = scoped_session(sessionmaker(bind=engine))

Base = declarative_base()


Base.metadata.create_all(engine)