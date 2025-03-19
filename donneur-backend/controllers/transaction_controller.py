from models import Transaction, Receiver



class TransactionController:

    def send( sender_id : str, receiver_id : str, amount : float ) :

        

        sender : Receiver = Receiver( sender_id )
        receiver : Receiver = Receiver( receiver_id )

        try:
            sender.withdraw(amount)
        except Exception as e:
            raise e
        

        receiver.deposit(amount)
        Transaction.create_transaction(receiver_id, amount, Transaction.TransactionType.SEND, sender_id)
        
        

    def withdraw( sender_id : str, organization_id : str, amount : float) :

        sender : Receiver = Receiver(sender_id)

        try:
            sender.withdraw(amount)
        except Exception as e:
            raise e
        
        Transaction.create_transaction(organization_id, amount, Transaction.TransactionType.WITHDRAW, sender_id)


    def get_transactions( receiver_id : str ):
        txs = Transaction.get_transactions( receiver_id )
        return txs