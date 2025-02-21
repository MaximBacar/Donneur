from    firebase_connector  import  Database
import  dotenv
import  random
import  string
import  uuid
import  os
import  base64
import  io
from    PIL import Image
import  stripe

class Donneur:
    '''
    Handle server-side logic
    '''

    def __generate_user_id(self):
        ID_LENGTH = 10
        is_unique = False

        while(not is_unique):
            user_id = ''.join(random.choices(string.ascii_letters + string.digits, k=ID_LENGTH))
            if self.database.get_receiver( user_id ) == None:
                is_unique = True

        return user_id
    
    
    def __genenrate_file_id(self, id):
        return f'{id}_{str(uuid.uuid4())}.png'
    


    def create_receiver(self, fn, ln, dob):
        id = self.__generate_user_id()
        self.database.create_receiver(fn, ln, dob, id)
        return id
        
    def update_receiver_email(self, receiver_id, email):
        self.database.update_receiver_email(receiver_id, email)

    def get_image( self , image_id ):
        image_path = os.path.join(self.image_folder, image_id)
        print(image_path)
        if os.path.exists(image_path):
            return image_path
        return None
    

    def add_id_document( self , id , file):
        picture_id = self.__genenrate_file_id( id )
        try:
            image_bytes = base64.b64decode(file)
            image = Image.open(io.BytesIO(image_bytes))
     
            image.save(os.path.join(self.image_folder, picture_id), 'PNG')
            self.database.set_document_picture( id, picture_id )
        except:
            pass
    
    def add_profile_picture( self , id , file):
        picture_id = self.__genenrate_file_id( id )
        try:
            # file.save(os.path.join(self.image_folder, picture_id))
            # self.database.set_profile_picture( id, picture_id )

            image_bytes = base64.b64decode(file)
            image = Image.open(io.BytesIO(image_bytes))
     
            image.save(os.path.join(self.image_folder, picture_id), 'PNG')
            self.database.set_profile_picture( id, picture_id )
        except:
            pass



    def donation(self, amount : float, receiver_id : str):
        try:
            converted_amount = int(amount * 100)
            intent = stripe.PaymentIntent.create(
                amount                      = converted_amount,
                currency                    = 'cad',
                payment_method_types        = ['card']
                )
            print('Payment succesfully created')

            self.database.create_transcation(
                receiver_id = receiver_id,
                amount      = amount,
                currency    = 'cad',
                type        = 'donation',
                stripe_id   = intent['id'],
                
            )
            return intent['client_secret']
        
        except Exception as error:
            print(f"Error: {str(error)}")
            return False
        
    def confirm_donation(self, payment_intent):
       
        stripe_id = payment_intent['id']
        payment_method = payment_intent['payment_method']
        sender_details = stripe.PaymentMethod.retrieve(payment_method)

        address = sender_details['billing_details']['address']
        address['address']  = address['line1']
        address['apt']      = address['line2']
        del address['line1']
        del address['line2']

        name = sender_details['billing_details']['name']

        pm_info = {
            'wallet'    : sender_details['card']['wallet']['type'],
            'card'      : sender_details['card']['brand']
        }


        sender_id = self.database.create_sender(name = name, address = address, isAnonymous = True)

        amount, receiver_id = self.database.confirm_transaction(stripe_id, sender_id=sender_id,payment_method=pm_info)

        self.database.add_balance( receiver_id, amount )

    def cancel_donation(self, clientSecret):
        try:
            stripe.PaymentIntent.cancel(clientSecret)
            return True
        except Exception as error:
            print(f"Error: {str(error)}")
            return False

    # ========== withdraw

    def withdraw(self, amount : float, organization_id : str, sender_id : str):
        
        # Sanitize amount to be negative
        amount = abs(amount)

        self.database.create_transcation(
            receiver_id = organization_id, 
            sender_id   = sender_id, 
            amount      = amount,
            currency    = 'CAD',
            confirmed   = True,
            type        = 'withdraw'
            )
        
        self.database.deduct_balance( sender_id, amount )

    def __generate_folders(self):
        if not os.path.exists(self.image_folder):
            os.mkdir(self.image_folder)

    def __init__(self):
        dotenv.load_dotenv()
        self.image_folder               = os.getenv('IMAGE_FOLDER')
        self.stripe_key                 = os.getenv('STRIPE_KEY')
        self.firebase_credentials_path  = os.getenv('FIREBASE_CRED_PATH')

        stripe.api_key = self.stripe_key
        stripe.PaymentMethodDomain.create(domain_name="give.donneur.ca")
        self.database                   = Database(self.firebase_credentials_path)


        self.__generate_folders()


# d = Donneur()
# d.donation(4,'uzS6R6ZwE7')



