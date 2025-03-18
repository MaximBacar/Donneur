from    firebase_admin import storage, db
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

    def upload_image(user_id: str, media_type: MediaType, firebase_link: str):
    
        match media_type:
            case MediaController.MediaType.ID_DOCUMENT:
                path = f'/receivers/{user_id}/id_document_file'
            case MediaController.MediaType.ID_PICTURE:
                path = f'/receivers/{user_id}/id_picture_file'
            case MediaController.MediaType.LOGO:
                path = f'/organizations/{user_id}/logo_file'
       
            case MediaController.MediaType.BANNER:
                path = f'/organizations/{user_id}/banner_file'
            
            case _:
                raise ValueError("Unsupported media type for database storage")
            
        reference : db.Reference = db.reference(path)

        if not reference.parent.get():
            raise ValueError("Invalid user")
        
        reference.set(firebase_link)
        

      
        
        