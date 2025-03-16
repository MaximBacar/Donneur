from    firebase_admin  import db
from    datetime        import datetime
from    models          import Transaction, Sender


import  stripe

class PaymentController():

    def __format_payment_method( stripe_payment_method : dict ) -> dict:
        payment_method = {
            'wallet'    : stripe_payment_method['wallet']['type'],
            'card'      : stripe_payment_method['brand']
        }
        return payment_method

    def create_payment( receiver_id : str, amount : float, IP : str = '' ) -> str:
        
        converted_amount = int(amount * 100)
        intent = stripe.PaymentIntent.create(
            amount                      = converted_amount,
            currency                    = 'cad',
            payment_method_types        = ['card']
        )

        Transaction.create_transaction( 
            receiver_id = receiver_id,
            amount      = amount,
            type        = Transaction.TransactionType.DONATION,
            IP          = IP,
            stripe_id   = intent['id']
        )

        return intent['client_secret']

    def confirm_payment( payment_intent : dict ) -> None:
        stripe_id               = payment_intent['id']
        sender_payment_method   = payment_intent['payment_method']
        sender_details          = stripe.PaymentMethod.retrieve(sender_payment_method)

        sender_address          = sender_details['billing_details']['address']
        sender_name             = sender_details['billing_details']['name']

        payment_method          = PaymentController.__format_payment_method( sender_details['card'] )

        sender_id               = Sender.create_anonymous( sender_name, sender_address )

        Transaction.confirm_transaction(stripe_id, sender_id, payment_method)

    def cancel_payment(self, clientSecret):
        try:
            stripe.PaymentIntent.cancel(clientSecret)
            return True
        except Exception as error:
            print(f"Error: {str(error)}")
            return False
