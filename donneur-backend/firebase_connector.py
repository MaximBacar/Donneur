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

    
    def create_receiver( self, fn : str, ln : str, dob):
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
            'email'         : "",
            'app_account'   : False
        }

        receiver_ref = reference.push(data)
        return receiver_ref.key

    def update_receiver_email(self, receiver_id, email):
        """Updates the email field for an existing receiver."""
        reference = db.reference(f'/receivers/{receiver_id}')
        reference.update({'email': email})


    def create_sender(self, name, address, isAnonymous : False):
        reference = db.reference('senders')
        data = {
            'name' : name,
            'address' : address,
            'isAnonymous' : isAnonymous
        }
        response = reference.push(data)
        return response.key
        
    def create_transcation(self, receiver_id, amount, currency, type, stripe_id="", sender_id = "", ip="",confirmed=False):
        print(receiver_id)
        reference = db.reference('transactions')
        data = {
            'amount'        : amount,
            'currency'      : currency,
            'confirmed'     : confirmed,
            'creation_date' : datetime.now().isoformat(),
            'receiver_id'   : receiver_id,
            'sender_id'     : sender_id,
            'type'          : type,
            'ip'            : ip
        }
        if stripe_id != "":
            reference.child(stripe_id).set(data)
        else:
            reference.push(data)
    def confirm_transaction (self, stripe_id, sender_id="", payment_method = None):
        if stripe_id:
            reference = db.reference(f'transactions/{stripe_id}')
            data = {
                'confirmed' : True,
                'sender_id':sender_id,
                'payment_methods' : payment_method
            }
            reference.update(data)


            tx_data =reference.get()
            return tx_data['amount'], tx_data['receiver_id']
        
        return None


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
        
    def deduct_balance( self, id, amount):
        amount = -1 * amount
        self.add_balance(id, amount)

    def get_balance( self, id ):
        reference = db.reference(f'/receivers/{id}')
        data = reference.get()
        if data:
            return True, data['balance']
        
        return False, None
        

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
        return None
        

    def get_uid( self, id ):
        reference = db.reference(f'/users')
        users = reference.get()

        for user in users:
            data = users[user]
            if data['db_id'] == id:
                return user
        return None


    def get_transactions(self, receiver_id=None, organization_id=None):
        # Return empty if neither parameter is provided
        if not receiver_id and not organization_id:
            return []
        
        reference = db.reference('/transactions')
        transactions = []
        
        # If receiver_id is provided, get their transactions
        if receiver_id:
            # Query 1: Get transactions where receiver_id is the recipient
            receiver_query = reference.order_by_child('receiver_id').equal_to(receiver_id)
            receiver_txs = receiver_query.get()
            if receiver_txs:
                for tx_id, tx_data in receiver_txs.items():
                    if tx_data.get('confirmed', False):
                        tx_data['id'] = tx_id
                        tx_data['transaction_type'] = 'received'
                        transactions.append(tx_data)
            
            # Query 2: Get transactions where receiver_id is the sender
            sender_query = reference.order_by_child('sender_id').equal_to(receiver_id)
            sender_txs = sender_query.get()
            if sender_txs:
                for tx_id, tx_data in sender_txs.items():
                    if tx_data.get('confirmed', False):
                        tx_data['id'] = tx_id
                        tx_data['transaction_type'] = 'sent'
                        transactions.append(tx_data)
        
        # If organization_id is provided, get organization transactions
        if organization_id:
            # Query 3: Get transactions where organization_id is the recipient
            org_receiver_query = reference.order_by_child('receiver_id').equal_to(organization_id)
            org_receiver_txs = org_receiver_query.get()
            if org_receiver_txs:
                for tx_id, tx_data in org_receiver_txs.items():
                    if tx_data.get('confirmed', False):
                        tx_data['id'] = tx_id
                        tx_data['transaction_type'] = 'received'
                        # Avoid duplicate transactions if same as receiver_id
                        if not any(t['id'] == tx_id for t in transactions):
                            transactions.append(tx_data)
            
            # Query 4: Get transactions where organization_id is the sender
            org_sender_query = reference.order_by_child('sender_id').equal_to(organization_id)
            org_sender_txs = org_sender_query.get()
            if org_sender_txs:
                for tx_id, tx_data in org_sender_txs.items():
                    if tx_data.get('confirmed', False):
                        tx_data['id'] = tx_id
                        tx_data['transaction_type'] = 'sent'
                        # Avoid duplicate transactions if same as receiver_id
                        if not any(t['id'] == tx_id for t in transactions):
                            transactions.append(tx_data)
        
        # Sort transactions by creation date (newest first)
        transactions.sort(
            key=lambda x: datetime.fromisoformat(x.get('creation_date', '2000-01-01')), 
            reverse=True
        )
        
        return transactions

    