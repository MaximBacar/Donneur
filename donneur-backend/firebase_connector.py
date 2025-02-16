from    firebase_admin          import  credentials, db
from    firebase_admin          import  firestore
import  firebase_admin

from    google.cloud.firestore  import  FieldFilter

from    datetime                import  datetime

class Database:


    def __init__(self, firebase_credentials_path):
        firebase_credentials = credentials.Certificate(firebase_credentials_path)
        firebase_admin.initialize_app(firebase_credentials, {'databaseURL': 'https://capstone-3828a-default-rtdb.firebaseio.com/'})

        # self.db = firestore.client()

    
    def create_receiver( self, fn : str, ln : str, username : str, id):
        reference = db.reference('/receivers')
        data = {
            'balance'       : 0,
            'creation_date' : datetime.now().isoformat(),
            'first_name'    : fn,
            'last_name'     : ln,
            'username'      : username,
            'picture_id'    : ""
        }

        reference.child(id).set(data)

    def get_receiver( self, id ) -> dict:
        reference = db.reference(f'/receivers/{id}')
        data = reference.get()
        
        if data:
            return data
        else:
            return None

    def add_balance( self, id, amount ) -> bool:
        reference = db.reference(f'/receivers/{id}')
        data = reference.get()
        if data:
            balance = data['balance']
            new_balance = balance + amount

            reference.update({'balance' : new_balance})

            return True
        else:
            return False
        
    def set_profile_picture( self, id, picture_id ):
        reference = db.reference(f'/receivers/{id}')

        data = reference.get()
        if data:
            reference.update({'picture_id' : picture_id})
            return True

        else:
            return False



        