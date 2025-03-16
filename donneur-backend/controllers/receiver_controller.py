import  re
import  enum
from    utils           import SendMail
from    models          import Receiver
from    datetime        import datetime
from    firebase_admin  import db, auth


class ReceiverError(Exception):
    class InvalidDateOfBirthFormat(Exception):
        pass
    class InvalidEmailFormat(Exception):
        pass
    class ReceiverNotFound(Exception):
        pass
    class AlreadyHasApp(Exception):
        pass
    class NoLinkedEmail(Exception):
        pass

class ReceiverController():

    def exists( receiver_id : str ) -> bool:
        receiver : Receiver = Receiver( receiver_id )
        if receiver.get():
            return True
        return False

    def create_receiver( first_name : str, last_name : str, dob : str) -> str:

        receiver : Receiver = Receiver.create( first_name, last_name, dob )

        return receiver.id
    
    def update_email( receiver_id : str, email : str ) -> None:
        
        receiver : Receiver = Receiver( receiver_id )
        receiver.set_email( email )
    
    def send_account_creation_link( receiver_id : str ):
        
        receiver        : Receiver  = Receiver( receiver_id )
        receiver_data   : dict      = receiver.get()

        email           : str       = receiver_data.get('email')

        SendMail.send_password_creation_email( email, f'https://www.donneur.ca/create/{receiver.id}')

    def verify_account_creation_link ( self, receiver_id : str ) -> bool:
        
        receiver : Receiver = Receiver ( receiver_id )
        if receiver.has_app():
            return False
        return True

    def create_app_account ( receiver_id : str, password : str ):

        receiver        : Receiver      = Receiver( receiver_id )
        users_reference : db.Reference  = db.reference( f'/users' )

        receiver_data : dict = receiver.get()
        
        if not receiver_data:
            raise ReceiverError.ReceiverNotFound()
        
        if not receiver_data.get('email'):
            raise ReceiverError.NoLinkedEmail()

        if receiver_data.get('has_app_access'):
            raise ReceiverError.AlreadyHasApp()

        firebase_user : auth.UserRecord = auth.create_user (
                email       = receiver_data.get('email'),
                password    = password,
        )

        users_reference.child(firebase_user.uid).set(
            {
                'id'    : receiver_id,
                'role'  : 'receiver'
            }
        )

        receiver.set_app()