from    firebase_admin  import db
from    models          import Receiver
from    datetime        import datetime
from    models          import Model, User
import  enum


class Transaction(Model):

    class TransactionError(Exception):
        class InvalidTransactionType(Exception) : pass
        class ReceiverNotFoundError(Exception)  : pass
        class NoStripePaymentMethod(Exception)  : pass
        class TransactionNotFound(Exception)    : pass
        class SenderNotFoundError(Exception)    : pass
        class InvalidAmountError(Exception)     : pass
        class NoSenderError(Exception)          : pass
        
    class TransactionType(enum.Enum):

        DONATION    = 'donation'
        WITHDRAW    = 'withdrawal'
        SEND        = 'send' 


    BASE_TABLE  : str           = 'transactions'

    def __init__(self, id):
        super().__init__(id, Transaction.BASE_TABLE)

    def create_transaction( receiver_id : str, amount : float, type : TransactionType, sender_id : str = '', IP : str = '', stripe_id : str = None ) -> None:
        
        if amount < 0.00:
            raise Transaction.TransactionError.InvalidAmountError( 'Amount must be a postive float' )
        if type == Transaction.TransactionType.SEND:
            if not sender_id:
                raise Transaction.TransactionError.NoSenderError( 'No sender assigned')
            

        reference = db.reference(Transaction.BASE_TABLE)
        transaction_data = {
            'creation_date' : datetime.now().isoformat(),
            'receiver_id'   : receiver_id,
            'confirmed'     : True,
            'sender_id'     : sender_id,
            'currency'      : 'cad',
            'amount'        : amount,
            'type'          : type.value,
            'IP'            : IP
        }

        if stripe_id:
            reference.child(stripe_id).set(transaction_data)
        else:
            reference.push(transaction_data)

    def __confirm_donation( amount : float, payment_method : dict, receiver_id : str, sender_id : str, IP : str):
        confirmation_data   : dict = {
            'payment_methods'   : payment_method,
            'sender_id'         : sender_id,
            'confirmed'         : True,
        }

        receiver : Receiver = Receiver.get ( receiver_id )
        receiver.deposit( amount )

        return confirmation_data

    def __confirm_withdrawal( amount : float, sender_id : str):
        confirmation_data   : dict = {
            'confirmed' : True
        }
        receiver_making_withdrawal : Receiver = Receiver.get( sender_id )
        receiver_making_withdrawal.withdraw( amount )

        return confirmation_data
    
    def __confirm_send( amount : float, receiver_id : str, sender_id : str, IP : str):
        confirmation_data   : dict = {
            'confirmed' : True,
        }

        sender  : Receiver = Receiver.get ( sender_id )
        sender.withdraw( amount )

        receiver: Receiver = Receiver.get ( receiver_id )
        receiver.deposit( amount )


        return confirmation_data
    
    def confirm_transaction( transaction_id : str , sender_id : str = None, payment_method : dict = None):
        reference           : db.Reference  = db.reference(f'/{Transaction.BASE_TABLE}/{transaction_id}')
        transaction         : dict          = reference.get()

        if not transaction:
            raise Transaction.TransactionError.TransactionNotFound()

        
        transaction_receiver    : str   = transaction['receiver_id']
        transaction_sender      : str   = transaction['sender_id']
        transaction_amount      : float = transaction['amount']
        transaction_type        : str   = transaction['type']
        

        match transaction_type:
            case Transaction.TransactionType.DONATION.value:
                if not sender_id:
                    raise Transaction.TransactionError.NoSenderError()
                if not payment_method:
                    raise Transaction.TransactionError.NoStripePaymentMethod()
                confirmation_data = Transaction.__confirm_donation( transaction_amount, payment_method, transaction_receiver, sender_id)
            
            case Transaction.TransactionType.WITHDRAW.value:
                confirmation_data = Transaction.__confirm_withdrawal( transaction_amount, transaction_sender)

            case Transaction.TransactionType.SEND.value:
                confirmation_data = Transaction.__confirm_send( transaction_amount, transaction_receiver, transaction_sender)

        if not confirmation_data:
            raise Transaction.TransactionError.InvalidTransactionType()
        

        reference.update(confirmation_data)


        return transaction_amount, transaction_receiver

    def get_transactions( user_id : str):

        reference       : db.Reference = db.reference('/transactions')
        
        user_types      : list = ['receiver_id', 'sender_id']
        transactions    : list = []
        
        for user_type in user_types:
            query : db.Query = reference.order_by_child(user_type).equal_to(user_id)
            transactions_data = query.get()
            for transaction_id in transactions_data:
                transaction = transactions_data[transaction_id]
                transaction['id'] = transaction_id

                transactions.append(transaction)
     
        sorted_transactions = sorted(transactions, key=lambda x: datetime.fromisoformat(x['creation_date']), reverse=True)
        
        return sorted_transactions