from datetime       import datetime
from models.user    import User
from firebase_admin import db


class Sender(User):

    class SenderError(Exception):
        pass

    USER_TYPE   : User.UserType = User.UserType.SENDER
    BASE_TABLE  : str           = 'senders'

    def __format_address( stripe_address : dict ) -> dict:
        address : dict = {
            'postal_code'   : stripe_address['postal_code'],
            'province'      : stripe_address['state'],
            'country'       : stripe_address['country'],
            'street'        : stripe_address['line1'],
            'city'          : stripe_address['city'],
            'apt'           : stripe_address['line2'],
        }
        return address

    def __init__( self, id : str):
        super().__init__( id = id , user_type = Sender.USER_TYPE )

    def create( first_name : str, last_name : str, email : str) -> str:
        if not Sender._validate_email_format( email ):
            raise Sender.UserError.InvalidEmailFormat()
        
        reference = db.reference(Sender.BASE_TABLE)
        sender_data = {
            'is_anonymous'  : False,
            'created_at'    : datetime.now().isoformat(),
            'first_name'    : first_name,
            'last_name'     : last_name,
            'email'         : email
        }

        sender = reference.push(sender_data)
        return sender.key
    
    def create_anonymous( name : str, stripe_address : dict ) -> str:

        address = Sender.__format_address( stripe_address )

        reference = db.reference(Sender.BASE_TABLE)
        sender_data = {
            'is_anonymous'  : True,
            'created_at'    : datetime.now().isoformat(),
            'address'       : address,
            'name'          : name
        }

        sender = reference.push(sender_data)
        return sender.key

        