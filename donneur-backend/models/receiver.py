from    __future__      import annotations
from    firebase_admin  import db
from    models.user     import User
from    datetime        import datetime



class Receiver(User):

    class ReceiverError(Exception):
        class InsufficientFunds(Exception):pass

    USER_TYPE   : User.UserType = User.UserType.RECEIVER
    BASE_TABLE  : str           = 'receivers'
    
    def __init__ ( self, id : str):
        super().__init__( id = id , user_type = Receiver.USER_TYPE )


    def create ( first_name : str, last_name : str, dob : str) -> str:
        if not Receiver._validate_dob_format( dob ):
            raise Receiver.UserError.InvalidDateOfBirthFormat()
        
        reference = db.reference(Receiver.BASE_TABLE)
        receiver_data = {
            'id_document_file'  : '',
            'id_picture_file'   : '',
            'has_app_access'    : False,
            'creation_date'     : datetime.now().isoformat(),
            'first_name'        : first_name,
            'last_name'         : last_name,
            'balance'           : 0.00,
            'email'             : '',
            'dob'               : dob,
        }

        receiver = reference.push(receiver_data)
        return Receiver( receiver.key )
    
    def set_email ( self, email : str ):
        COLUMN : str = 'email'
        if not Receiver._validate_email_format( email ):
            raise Receiver.UserError.InvalidEmailFormat()
        reference   : db.Reference  = self.reference.child(COLUMN)
        reference.set( email )
        
    def deposit ( self, amount : float ) -> float:
        COLUMN      : str           = 'balance'
        reference   : db.Reference  = self.reference.child(COLUMN)
        balance     : float         = float(reference.get())

        updated_balance = balance + abs(amount)

        if updated_balance < 0.00:
            raise Receiver.ReceiverError.InsufficientFunds()

        reference.set(updated_balance)
        return updated_balance

    def withdraw ( self, amount : float ) -> float:
        COLUMN      : str           = 'balance'
        reference   : db.Reference  = self.reference.child(COLUMN)
        balance     : float         = float(reference.get())

        updated_balance = balance - abs(amount)

        if updated_balance < 0.00:
            raise Receiver.ReceiverError.InsufficientFunds()

        reference.set(updated_balance)

    def get_balance ( self ) -> float:
        COLUMN      : str           = 'balance'
        reference   : db.Reference  = self.reference.child(COLUMN)
        balance     : float         = float(reference.get())
        return balance
    

    def has_app ( self ) -> bool:
        return self.reference.child('has_app_access').get()
    
    def set_app ( self ) -> None:
        self.reference.child('has_app_access').set(True)


