from .base import Base, engine, Session
from .models import Announcement, Occupancy, Organization, Receiver, Sender, Transaction, Withdrawal

# Create all tables
Base.metadata.create_all(engine)