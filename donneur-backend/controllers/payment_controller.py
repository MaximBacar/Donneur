from    firebase_admin  import db
from    datetime        import datetime
from    models          import Transaction, Sender, Receiver


import  stripe

class PaymentController():

    class PaymentError(Exception):
        class ReceiverNotFound(Exception) : pass
    def __format_payment_method( stripe_payment_method : dict ) -> dict:
        payment_method = {
            'wallet'    : stripe_payment_method['wallet']['type'],
            'card'      : stripe_payment_method['brand']
        }
        return payment_method

    def create_payment( receiver_id : str, amount : float, IP : str = '' ) -> str:
        receiver : Receiver = Receiver(receiver_id)

        if not receiver.exist():
            raise PaymentController.PaymentError.ReceiverNotFound('Receiver Not Found')
        
        converted_amount = int(amount * 100)
        intent = stripe.PaymentIntent.create(
            amount                      = converted_amount,
            currency                    = 'cad',
            payment_method_types        = ['card']
        )
        
        reference : db.Reference = db.reference(f'/payments/{intent["id"]}')

        payment_data = {
            'receiver_id'   : receiver_id,
            'amount'        : amount,
            'confirmed'     : False,
            'curency'       : 'cad',
            'creation_date' : datetime.now().isoformat()
        }
        
        reference.set(payment_data)

        return intent['client_secret']

    def confirm_payment( payment_intent : dict ) -> None:
        stripe_id               = payment_intent['id']
        sender_payment_method   = payment_intent['payment_method']
        sender_details          = stripe.PaymentMethod.retrieve(sender_payment_method)

        sender_address          = sender_details['billing_details']['address']
        sender_name             = sender_details['billing_details']['name']

        payment_method          = PaymentController.__format_payment_method( sender_details['card'] )

        sender_id               = Sender.create_anonymous( sender_name, sender_address )

        reference = db.reference(f'/payments/{stripe_id}')

        payment : dict = reference.get()

        if not payment:
            return
        
        reference.child('confirmed').set(True)
        reference.child('confirmation_date').set(datetime.now().isoformat())
        
        receiver_id = payment.get('receiver_id')
        amount = payment.get('amount')
        IP = payment.get('IP')
        

        receiver : Receiver = Receiver(receiver_id)

        receiver.deposit(amount)

        Transaction.create_transaction( 
            receiver_id = receiver_id,
            sender_id   = sender_id,
            amount      = amount,
            type        = Transaction.TransactionType.DONATION,
            IP          = IP,
            stripe_id   = stripe_id,

        )

    def cancel_payment( client_secret : str ):

        stripe_id = client_secret.split('_secret_')[0]

        reference = db.reference(f'/payments/{stripe_id}')

        reference.delete()
        stripe.PaymentIntent.cancel( stripe_id )
