from    dotenv      import  load_dotenv
import  os

class Donneur:
    '''
    Handle server-side logic
    '''

    def __generate_folders(self):
        if not os.path.exists(self.image_folder):
            os.mkdir(self.image_folder)

    def __init__(self):
        load_dotenv()
        self.image_folder = os.getenv('IMAGE_FOLDER')
        self.stripe_key = os.getenv('STRIPE_KEY')


        self.__generate_folders()


