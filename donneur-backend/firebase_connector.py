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

    
    def create_receiver( self, fn : str, ln : str, dob, id):
        reference = db.reference('/receivers')
        data = {
            'balance'       : 0,
            'creation_date' : datetime.now().isoformat(),
            'first_name'    : fn,
            'last_name'     : ln,
            'dob'           : dob,
            'username'      : "",
            'picture_id'    : "",
            'id_doc_id'     : "",
            'email'         : ""
        }

        reference.child(id).set(data)

    def update_receiver_email(self, receiver_id, email):
        """Updates the email field for an existing receiver."""
        reference = db.reference(f'/receivers/{receiver_id}')
        reference.update({'email': email})
        

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
            'banner_id'     : ""
        }
        response = reference.push(data)
        self.set_uid(response.key, 'organizations', uid)

    def get_receiver( self, id ) -> dict:
        reference = db.reference(f'/receivers/{id}')
        data = reference.get()
        
        if data:
            return data
        else:
            return None
        
    def get_organization( self, id ) -> dict:
        reference = db.reference(f'/organizations/{id}')
        data = reference.get()
        
        if data:
            return data
        else:
            return None
        
    def set_uid(self, db_id, role, uid):
        reference = db.reference(f'/users')
        reference.child(uid).set({
            'db_id':db_id,
            'role' : role
            })


    def get_id_from_uid(self, uid):
        reference = db.reference(f'/users/{uid}')
        data = reference.get()
        return data
        
    def get_all_organizations(self):
        reference = db.reference('/organizations')
        data = reference.get()
        return data

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
        

    def set_document_picture( self, id, picture_id ):
        reference = db.reference(f'/receivers/{id}')

        data = reference.get()
        if data:
            reference.update({'id_doc_id' : picture_id})
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
        user_id = self.get_id_from_uid(uid)
        if user_id:
            data = {}
            if user_id['role'] == 'receivers':
                data = self.get_receiver(user_id['db_id'])
            if user_id['role'] == 'organizations':
                data = self.get_organization(user_id['db_id'])

            data['db_id'] = user_id['db_id']
            data['role'] = user_id['role']
            data['uid'] = uid

            return data
        

    def get_uid( self, id ):
        reference = db.reference(f'/users')
        users = reference.get()

        for user in users:
            data = users[user]
            if data['db_id'] == id:
                return user
        return None