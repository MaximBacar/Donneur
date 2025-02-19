from    firebase_admin          import  credentials, db
from    firebase_admin          import  firestore
import  firebase_admin

from    google.cloud.firestore  import  FieldFilter

from    datetime                import  datetime

class Database:


    def __init__(self, firebase_credentials_path):
        self.tables = ['receivers','organizations']
        firebase_credentials = credentials.Certificate(firebase_credentials_path)
        firebase_admin.initialize_app(firebase_credentials, {'databaseURL': 'https://capstone-3828a-default-rtdb.firebaseio.com/'})

        # self.db = firestore.client()

    
    def create_receiver( self, fn : str, ln : str, dob, id):
        reference = db.reference('/receivers')
        data = {
            'balance'       : 0,
            'creation_date' : datetime.now().isoformat(),
            'first_name'    : fn,
            'last_name'     : ln,
            'dob'           : dob,
            'username'      : "",
            'uid'           : "",
            'picture_id'    : ""
        }

        reference.child(id).set(data)

    def create_organization (self , name, description, address, zip, city, province, max_occupancy, uid):
        reference = db.reference('/organizations')
        data = {
            'name'          : name,
            'description'   : description,
            'address'       : {
                'address'   : address,
                'zip'       : zip,
                'city'      : city,
                'province'  : province
            },
            'max_occupancy' : max_occupancy,
            'logo_id'       : "",
            'banner_id'     : "",
            'uid'           : uid
        }
        reference.push(data)

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
        

    def get_user_from_uid( self, uid ):
        for table in self.tables:
            reference = db.reference(f'/{table}')
            query = reference.order_by_child('uid').equal_to(uid).get()

            if query:
                key     = next(iter(query))
                data    = query[key]
                data['key'] = key
                data['role'] = table[:-1]
                return data
        return None
