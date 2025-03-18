from models import Transaction

class TransactionController:

    def send( sender_id : str, receiver_id : str, amount : float ) : pass
    def withdraw( receiver_id : str, organization_id : str, amount : float) : pass

    def get_transactions( receiver_id : str ):
        txs = Transaction.get_transactions( receiver_id )
        return txs