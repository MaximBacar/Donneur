import  re
import  enum
from    models          import Model
from    datetime        import datetime
from    firebase_admin  import db


class User(Model):

    class UserError(Exception):
        class InvalidDateOfBirthFormat(Exception):pass
        class InvalidEmailFormat(Exception):pass

    class UserType(enum.Enum):
        
        SENDER          = 'sender'
        RECEIVER        = 'receiver'
        ORGANIZATION    = 'organization'

    def _validate_dob_format(dob : str ) -> bool:
        try:
            datetime.strptime(dob, "%d-%m-%Y")
            return True
        except ValueError:
            return False
    
    def _validate_email_format(email : str) -> bool:
        pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        return bool(re.match(pattern, email))

    def __init__(self, id : str, user_type : UserType):

        super().__init__(id, f'{user_type.value}s')


    def get_user ( id : str ):
        for user_type in User.UserType:
            reference = db.reference(f'/{user_type.value}/{id}')
            user_data = reference.get()
            if user_data:
                match user_type:
                    case User.UserType.SENDER:
                        from models.sender import Sender
                        return Sender ( id )
                    case User.UserType.RECEIVER:
                        from models.receiver import Receiver
                        return Receiver( id )
                    case User.UserType.ORGANIZATION:
                        pass