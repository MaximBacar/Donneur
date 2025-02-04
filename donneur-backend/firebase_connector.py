from    firebase_admin  import credentials
from    firebase_admin  import firestore
import  firebase_admin

from    datetime        import datetime

class Database:


    def __init__(self):
        firebase_credentials = credentials.Certificate('/Users/maximbacar/Downloads/capstone-3828a-firebase-adminsdk-fbsvc-fe22bd393f.json')
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


db = Database()
db.create_receiver('Bob', 'Rob', 'bob.rob')