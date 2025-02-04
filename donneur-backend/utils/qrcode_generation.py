import qrcode
import qrcode.constants


class QRCode_Generation:
    def __init__(self):
        self.qr_code = qrcode.QRCode(
            version             = 5,
            error_correction    = qrcode.constants.ERROR_CORRECT_H,
            box_size            = 10,
            border              = 4
        )

        self.BASE_URL = "https://give.donneur.ca/"

    def generate( self, user_code ):
        self.qr_code.add_data(f"{self.BASE_URL}{user_code}")
        self.qr_code.make( fit = True )

        img = self.qr_code.make_image(fill = 'black', back_color = 'white')

        img.save('fff.png')