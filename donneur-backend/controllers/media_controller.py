from    firebase_admin import storage
from    PIL import Image
import  base64
import  enum
import  io
import  os



class MediaController:
    class MediaType(enum.Enum):
        ID_DOCUMENT     = 'id_document'
        ID_PICTURE      = 'id_picture'
        LOGO            = 'logo'
        BANNER          = 'banner'
        PICTURE         = 'picture'
        VIDEO           = 'video'

    def upload_image( user_id : str, media_type : MediaType, image_data):
        image_bytes = base64.b64decode( image_data )
        image : Image.Image = Image.open(io.BytesIO(image_bytes))

        temp_path = f"/tmp/{user_id}_{media_type.value}.png"
        image.save(temp_path)

        
        bucket = storage.bucket()
        blob = bucket.blob(f"{media_type.value}/{user_id}.png")
        blob.upload_from_filename(temp_path, content_type="image/png")

        public_url = blob.public_url
        

        return public_url
     
        
        