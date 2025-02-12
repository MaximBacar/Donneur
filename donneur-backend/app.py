from    flask               import  Flask,      request,    send_file
from    flask_cors          import  CORS
from    firebase_connector  import  Database
from    donneur             import  Donneur

import  stripe


class App():
    
    def __init__(self):
        self.app        = Flask(__name__)
        self.donneur    = Donneur()
        self.database   = Database(self.donneur.firebase_credentials_path)
        

        CORS(self.app, resources={r"/*": {
            "origins": "*",  # Allow all origins (for development)
            "methods": ["GET", "POST", "OPTIONS"],  # Allow these methods
            "allow_headers": ["Content-Type", "Authorization"]  # Allow these headers
        }})
        
        self.app.add_url_rule(  "/",                                "index",            self.index                                  )
        self.app.add_url_rule(  "/docs",                            "docs",             self.docs                                   )
        self.app.add_url_rule(  "/image/<image_id>",                "image",            self.image,                 methods=["GET"] )
        self.app.add_url_rule(  "/payment_profile/<profile_id>",    "payment_profile",  self.payment_profile,       methods=["GET"] )
        self.app.add_url_rule(  "/create_payment",                  "create_payment",   self.create_stripe_payment, methods=["POST"])
        self.app.add_url_rule(  "/cancel_payment",                  "cancel_payment",   self.cancel_stripe_payment, methods=["POST"])

        stripe.api_key = self.donneur.stripe_key
        stripe.PaymentMethodDomain.create(domain_name="give.donneur.ca")
        

    def index(self):
        return "Donneur.ca API"
    
    def image(self, image_id):
        
        if image_id:
            return f"ID : {image_id}"
        return 'Image not found', 404
    
    def payment_profile(self, profile_id):
        if profile_id:
            data = {
                'id'            : profile_id,
                'name'          : 'Jacob B.',
                'picture_url'   : 'https://www.donneur.ca/image/HbreJcj'
            }
            return data
        return 'No user', 400

    def docs(self):
        return "Donneur.ca API Docs"
    
    def create_receiver(self):
        return "Added"

    def create_stripe_payment(self):
        # TODO Validate that receiver_id exists, that 0.50 <= amount < 1000.00
        data = request.get_json()
        print(data)
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