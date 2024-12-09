from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session

# Setup database engine and session
engine = create_engine('sqlite:///donneur.db', pool_size=20, max_overflow=0)
Session = scoped_session(sessionmaker(bind=engine))

# Base class for models
Base = declarative_base()
