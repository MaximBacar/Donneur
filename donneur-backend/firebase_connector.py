from    firebase_admin          import  credentials
from    firebase_admin          import  firestore
import  firebase_admin

from    google.cloud.firestore  import  FieldFilter

from    datetime                import  datetime

class Database:


    def __init__(self, firebase_credentials_path):
        firebase_credentials = credentials.Certificate(firebase_credentials_path)
        firebase_admin.initialize_app(credential = firebase_credentials)

        self.db = firestore.client()

    
    def create_receiver( self, fn : str, ln : str, username : str):
        data = {
            'balance'       : 0,
            'card_id'       : None,
            'creation_date' : datetime.now(),
            'first_name'    : fn,
            'last_name'     : ln,
            'username'      : username,
            'picture_id'    : None
        }

        document = self.db.collection('Receivers').document()
        document.set(data)
    
    def get_receiver( self, username ):
        user_collection = self.db.collection('Receivers') 
        user = user_collection.where(filter=FieldFilter("username", "==", username)).limit(1).stream()
        
        for doc in user:
            data = doc.to_dict()
            print(data)