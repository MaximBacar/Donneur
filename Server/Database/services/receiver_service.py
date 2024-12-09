from ..base import Session
from ..models.receiver import Receiver



def get_receiver( id : int ) -> Receiver:
    with Session() as session:
        receiver = session.query(Receiver).filter(Receiver.id == id).first()

    return receiver