from flask_restful  import Resource, reqparse
from routes.authentication  import auth_required



class GetMessagesResource(Resource):
    @auth_required
    def get(self, user_id : str, role : str ):
        parser = reqparse.RequestParser()
        parser.add_argument('chat_id', type=str, required=True, help='chat_id cannot be blank')

        args    = parser.parse_args()
        chat_id = args['chat_id']


class SendMessageResource(Resource):

    @auth_required
    def post(self, user_id : str, role : str ):

        parser = reqparse.RequestParser()
        parser.add_argument('chat_id', type=str, required=True, help='chat_id cannot be blank')
        parser.add_argument('content', type=str, required=True, help='content cannot be blank')
        
        
        args    = parser.parse_args()
        chat_id = args['chat_id']
        content = args['content']
