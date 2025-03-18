from flask_restful          import Resource, reqparse
import logging
from routes.authentication  import auth_required
from controllers            import MediaController


class IdPictureUploadResource(Resource):
    
    def post(self):

        parser = reqparse.RequestParser()
        parser.add_argument('user_id', type=str, required=True, help="user_id is required")
        parser.add_argument('firebase_link', type=str, required=True, help="firebase_link is required")
        try:

            args = parser.parse_args()

            user_id         = args.get('user_id')
            firebase_link   = args.get('firebase_link')

            MediaController.upload_image(user_id, MediaController.MediaType.ID_PICTURE, firebase_link)

            return {'status': 'ok'}, 200

        except Exception as e:
            logging.error(str(e))
            return {'error': str(e)}, 400
        

class IdDocumentUploadResource(Resource):
    
    def post(self):

        parser = reqparse.RequestParser()
        parser.add_argument('user_id', type=str, required=True, help="user_id is required")
        parser.add_argument('firebase_link', type=str, required=True, help="firebase_link is required")
        try:

            args = parser.parse_args()

            user_id         = args.get('user_id')
            firebase_link   = args.get('firebase_link')

            MediaController.upload_image(user_id, MediaController.MediaType.ID_DOCUMENT, firebase_link)
            return {'status': 'ok'}, 200
        except Exception as e:
            logging.error(str(e))
            return {'error': str(e)}, 400
        
class LogoUploadResource(Resource):
    
    def post(self):

        parser = reqparse.RequestParser()
        parser.add_argument('user_id', type=str, required=True, help="user_id is required")
        parser.add_argument('firebase_link', type=str, required=True, help="firebase_link is required")
        try:

            args = parser.parse_args()

            user_id         = args.get('user_id')
            firebase_link   = args.get('firebase_link')

            MediaController.upload_image(user_id, MediaController.MediaType.LOGO, firebase_link)
            return {'status': 'ok'}, 200
        except Exception as e:
            logging.error(str(e))
            return {'error': str(e)}, 400
        
class BannerUploadResource(Resource):
    
    def post(self):

        parser = reqparse.RequestParser()
        parser.add_argument('user_id', type=str, required=True, help="user_id is required")
        parser.add_argument('firebase_link', type=str, required=True, help="firebase_link is required")
        try:

            args = parser.parse_args()

            user_id         = args.get('user_id')
            firebase_link   = args.get('firebase_link')

            MediaController.upload_image(user_id, MediaController.MediaType.BANNER, firebase_link)
            return {'status': 'ok'}, 200
        except Exception as e:
            logging.error(str(e))
            return {'error': str(e)}, 400