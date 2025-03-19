import  re
import  enum
from    utils           import SendMail
from    models          import Receiver
from    datetime        import datetime
from    firebase_admin  import db, auth
import logging


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
    class ReceiverNotFound(Exception): pass

class ReceiverController():


    def donation_profile( receiver_id : str ) -> dict:
        receiver : Receiver = Receiver(receiver_id)

        receiver_data : dict = receiver.get()

        profile = None

        if receiver_data:
            profile = {
                'id' : receiver_id,
                'name' : f'{receiver_data.get("first_name")} {receiver_data.get("last_name")[0]}.',
                'image_url' : receiver_data.get("id_picture_file")
            }
            return profile
        raise ReceiverError.ReceiverNotFound('Receiver not found')
    

    def create_receiver( first_name : str, last_name : str, dob : str) -> Receiver:

        receiver : Receiver = Receiver.create( first_name, last_name, dob )

        return receiver
    
    def update_email( receiver_id : str, email : str ) -> None:
        logging.info(f'UPDATING EMAIL RECEIVER : {receiver_id}')
        receiver : Receiver = Receiver( receiver_id )
        receiver.set_email( email )

        ReceiverController.send_account_creation_link( receiver_id )
    
    def send_account_creation_link( receiver_id : str ):
        print(f'SEND ACCOUNT LINK RECEIVER : {receiver_id}')
        logging.info(f'SEND ACCOUNT LINK RECEIVER : {receiver_id}')
        receiver        : Receiver  = Receiver( receiver_id )
        receiver_data   : dict      = receiver.get()

        email           : str       = receiver_data.get('email')

        print(f'SEND ACCOUNT LINK EMAIL : {email}')
        logging.info(f'SEND ACCOUNT LINK EMAIL : {email}')

        SendMail.send_password_creation_email( email, f'https://www.donneur.ca/setPassword?id={receiver.id}')

    def verify_account_creation_link ( receiver_id : str ) -> bool:
        
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

    def get_balance( receiver_id : str ) -> float:
        receiver : Receiver = Receiver(receiver_id)

        return receiver.get_balance()
    
    def get_receiver( receiver_id : str ) -> dict:
        receiver : Receiver = Receiver(receiver_id)
        return receiver.get()
    
    def get_profile( receiver_id : str ) -> dict:

        def format_date(date_string):
            date = datetime.fromisoformat(date_string)
            return date.strftime("%B %Y")
        receiver : Receiver = Receiver( receiver_id )

        data = receiver.get()

        if not data:
            raise ValueError("receiver_not_found")
        
        profile = {
            'picture_id' : data.get('id_picture_file'),
            'name' : f"{data.get('first_name')} {data.get('last_name')}",
            'member_since' : format_date(data.get('creation_date'))
        }
        return profile
