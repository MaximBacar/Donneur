from    flask               import  Flask,      request,    send_file
from    flask_cors          import  CORS
from    firebase_connector  import  Database
from    donneur             import  Donneur


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

        self.app.add_url_rule(  "/get_role",                        "get_role",         self.get_role,              methods=["GET"] )

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
        try:
            data = request.json.get('image_data')

            if not data or (not 'data:image/png;base64,' not in data):
                return {"error": "Invalid image data"}, 400
            
            image_data = data.split('base64,')[1]

            self.donneur.add_profile_picture('uzS6R6ZwE7', image_data)
            
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

    def docs(self):
        return "Donneur.ca API Docs"
    
    def create_receiver(self):
        data = request.get_json()

        if 'fn' in data and 'ln' in data and 'dob' in data:
            id = self.donneur.create_receiver(data['fn'], data['ln'], data['dob'])
            return {'receiver_id' : id}

        return 500
        
    
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



donneur_api = App()
donneur_app = donneur_api.app

if __name__ == "__main__":
    donneur_app.run(debug=True)