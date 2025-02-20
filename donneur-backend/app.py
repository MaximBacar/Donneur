from    flask               import  Flask,      request,    send_file,     jsonify
from    flask_cors          import  CORS
from    firebase_connector  import  Database
from    donneur             import  Donneur
from    firebase_admin      import  auth,         db  


import  stripe


class App():
    
    def __init__(self):
        self.app        = Flask(__name__)
        self.donneur    = Donneur()
        

        CORS(self.app, resources={r"/*": {
            "origins": "*",  # Allow all origins (for development)
            "methods": ["GET", "POST", "OPTIONS"],  # Allow these methods
            "allow_headers": ["Content-Type", "Authorization"]  # Allow these headers
        }})
        
        self.app.add_url_rule(  "/",                                "index",            self.index                                  )
        self.app.add_url_rule(  "/docs",                            "docs",             self.docs                                   )
        self.app.add_url_rule(  "/upload_image",                    "upload_image",     self.upload_image,          methods=["POST"])
        self.app.add_url_rule(  "/upload_base64",                   "upload_base64",    self.upload_base64,         methods=["POST"])
        self.app.add_url_rule(  "/image/<image_id>",                "image",            self.image,                 methods=["GET"] )
        self.app.add_url_rule(  "/payment_profile/<profile_id>",    "payment_profile",  self.payment_profile,       methods=["GET"] )
        self.app.add_url_rule(  "/create_payment",                  "create_payment",   self.create_stripe_payment, methods=["POST"])
        self.app.add_url_rule(  "/cancel_payment",                  "cancel_payment",   self.cancel_stripe_payment, methods=["POST"])
        self.app.add_url_rule(  "/create_receiver",                 "create_receiver",  self.create_receiver,       methods=["POST"])
        self.app.add_url_rule(  "/update_receiver_email",           "update_receiver_email", self.update_receiver_email, methods=["POST"])
        self.app.add_url_rule(  "/get_id/<profile_id>",             "get_id",           self.get_id,                methods=["GET"] )
        self.app.add_url_rule(  "/get_shelter_locations",           "get_shelter_locations", self.get_shelter_locations, methods=["GET"])
        self.app.add_url_rule(  "/get_role",                        "get_role",         self.get_role,              methods=["GET"] )
        self.app.add_url_rule(  "/get_user",                        "get_user",         self.get_user,              methods=["GET"] )
        self.app.add_url_rule(  "/get_uid",                         "get_uid",          self.get_uid,               methods=["GET"])
        self.app.add_url_rule(  "/get_db_id/<uid>",                 "get_db_id",        self.get_db_id,             methods=["GET"] )
        self.app.add_url_rule(  "/set_password", "                  set_password",      self.set_password,          methods=["POST"])

        stripe.api_key = self.donneur.stripe_key
        stripe.PaymentMethodDomain.create(domain_name="give.donneur.ca")
        

    def index(self):
        return "Donneur.ca API"
    
    def image(self, image_id):
        if image_id:
            image = self.donneur.get_image(image_id)
            if image:
                return send_file(image, mimetype='image/png')
        return 'Image not found', 404
    
    def upload_image(self):
        if 'image' not in request.files:
            return 400

        image = request.files['image']
        self.donneur.add_profile_picture('uzS6R6ZwE7', image)
        return {'status':'success'}
    
    def upload_base64(self):

        # TODO error handle, if user exist
        try:
            data        = request.json.get('image_data')
            image_type  = request.json.get('type')
            id          = request.json.get('id')

            if not data or (not 'data:image/png;base64,' not in data) or (not id) or (not image_type):
                return {"error": "Invalid image data"}, 400
            
            image_data = data.split('base64,')[1]

            if image_type == 'pp':
                self.donneur.add_profile_picture(id, image_data)
            elif image_type == 'doc':
                self.donneur.add_id_document(id, image_data)
            else:
                return {'status' : 400}
            
            
            return {'status' : 200}
        
        except Exception as e:
            return {"error": str(e)}, 500
    
    def payment_profile(self, profile_id):
        if profile_id:
            data = self.donneur.database.get_receiver( profile_id )
            if data:
                profile_data = {
                    'id'            : profile_id,
                    'name'          : f'{data["first_name"]} {data["last_name"][0]}.',
                    'picture_url'   : f'https://api.donneur.ca/image/{data["picture_id"]}'
                }
                return profile_data
            return 'No user', 400
        return 'No user', 400
    
    def get_shelter_locations(self):
        data = self.donneur.database.get_all_organizations()

        if data:
            return data
        
        return 400
    

    def get_uid(self):
        db_id = request.args.get('donneurID')
        if db_id:
            uid = self.donneur.database.get_uid(db_id)
            if uid:
                return {'uid':uid}
            
        return 400

    def get_db_id(self, uid):
        if uid:
            pass

    def get_id(self, profile_id):
        if profile_id:
            data = self.donneur.database.get_receiver( profile_id )
            if data:
                profile_data = {
                    'id'            : profile_id,
                    'name'          : f'{data["first_name"].upper()} {data["last_name"].upper()}.',
                    'picture_url'   : f'https://api.donneur.ca/image/{data["picture_id"]}',
                    'dob'           : data['dob']
                }
                return profile_data
            
        return 'No user', 400

    def docs(self):
        return "Donneur.ca API Docs"
    
    def create_receiver(self):
        data = request.get_json()

        if 'fn' in data and 'ln' in data and 'dob' in data:
            id = self.donneur.create_receiver(data['fn'], data['ln'], data['dob'])
            return {'receiver_id' : id}

        return 500

    def update_receiver_email(self):
        data = request.get_json()
        if 'receiver_id' in data and 'email' in data:
            self.donneur.update_receiver_email(data['receiver_id'], data['email'])
            return jsonify({'status': 'success'})
        return jsonify({'error': 'Missing receiver_id or email'}), 400
        
    def get_user(self):
        uid = request.args.get('uid')
        if uid:
            user_data = self.donneur.database.get_user_from_uid(uid)
            if user_data:
                return user_data
        return 400
    def get_role(self):
        uid = request.args.get('uid')
        if uid:
            user_data = self.donneur.database.get_user_from_uid(uid)
            if user_data:
                return {'role' : user_data['role']}
        return 400

    def create_stripe_payment(self):
        # TODO Validate that receiver_id exists, that 0.50 <= amount < 1000.00
        data = request.get_json()
        if 'amount' in data and data['amount']:
            try:
                converted_amount = int(data['amount'] * 100)
                intent = stripe.PaymentIntent.create(
                    amount                      = converted_amount,
                    currency                    = 'cad',
                    payment_method_types=['card']
                    )
                print('Payment succesfully created')
                return {'clientSecret': intent['client_secret']}
            except Exception as error:
                print(f"Error: {str(error)}")
                return "Error", 401

        return "Invalid", 400
    
    def cancel_stripe_payment(self):
        data = request.get_json()
        if 'clientSecret' in data and data['clientSecret']:
            try:
                stripe.PaymentIntent.cancel(data['clientSecret'])
                return 200
            except Exception as error:
                print(f"Error: {str(error)}")
                return "Error", 401
        return 400

    def set_password(self):
        """
        Endpoint for when a receiver sets their password.
        Expects JSON payload with receiver_id and password.
        Uses the email stored in the receiver record to create the Firebase Auth user,
        then updates the receiver record with the generated uid.
        """
        data = request.get_json()
        receiver_id = data.get('receiver_id')
        password = data.get('password')
        if not receiver_id or not password:
            return jsonify({'error': 'Missing receiver_id or password'}), 400

        # Look up the receiver record from the Realtime Database.
        receiver_ref = db.reference(f'/receivers/{receiver_id}')
        receiver = receiver_ref.get()
        if not receiver or not receiver.get('email'):
            return jsonify({'error': 'Receiver not found or email not set'}), 400

        email = receiver['email']
        try:
            # Create the Firebase Auth user with the stored email and provided password.
            user_record = auth.create_user(
                email=email,
                password=password,
            )
            # Update the receiver record with the new auth uid (stored as uid)
            receiver_ref.update({
                'uid': user_record.uid,
                'password_set_date': datetime.now().isoformat()
            })
             # Create a corresponding entry in the /users table.
            users_ref = db.reference('/users')
            users_ref.child(user_record.uid).set({
                'db_id': receiver_id,
                'role': 'receivers'
            })
            return jsonify({'status': 'success', 'uid': user_record.uid}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500




donneur_api = App()
donneur_app = donneur_api.app

if __name__ == "__main__":
    donneur_app.run(debug=True)