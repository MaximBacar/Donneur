from    firebase_admin          import  credentials
import  firebase_admin

import  logging
import  stripe
import  dotenv
import  os

class Controller:

    flask_secret    = None
    google_key      = None

    def __init_firebase():
        database_url                = os.getenv('DATABASE_URL')
        firebase_credentials_path   = os.getenv('FIREBASE_CRED_PATH')

        firebase_credentials        = credentials.Certificate(firebase_credentials_path)
        firebase_admin.initialize_app(firebase_credentials, {'databaseURL': database_url})

    def __init_stripe():
        donation_domain = os.getenv('DONATION_DOMAIN')
        stripe_key      = os.getenv('STRIPE_KEY')

        stripe.api_key  = stripe_key
        stripe.PaymentMethodDomain.create(domain_name=donation_domain)


    def initialize():
        
        logging.basicConfig(level=logging.INFO)
        dotenv.load_dotenv()
        
        Controller.__init_firebase()
        Controller.__init_stripe()

        Controller.flask_secret = os.getenv('SECRET_KEY')
        Controller.google_key   = os.getenv('GOOGLE_MAPS_API')
    

        