from ..base import Session
from ..models.sender import Sender



def get_sender( id : int ) -> Sender:
    with Session() as session:
        sender = session.query(Sender).filter(Sender.id == id).first()

    return sender