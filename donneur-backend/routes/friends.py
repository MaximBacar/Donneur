from flask_restful          import Resource, reqparse

from routes.authentication  import auth_required
from controllers            import FriendController

class GetFriendsResource(Resource):
    @auth_required
    def get( self, user_id : str, role : str  ):
        try:
            friends = FriendController.get_friends(user_id)
            return friends, 200
        except Exception as e:
            print(e)
            return {'error' : str(e)}

class AddFriendResource(Resource):
    @auth_required
    def post(self, user_id : str, role : str  ):
        parser = reqparse.RequestParser()
        parser.add_argument( 'friend_id', type=str, required=True, help='No friend_id provided' )
        args = parser.parse_args()
        try:
            FriendController.add_friend( user_id , args.get('friend_id'))
            return {'status' : 'ok'}, 200
        except Exception as e:
            return {'error' : str(e)}

class RemoveFriendResource(Resource):
    @auth_required
    def post(self,  user_id : str, role : str  ):
        parser = reqparse.RequestParser()
        parser.add_argument( 'friendship_id', type=str, required=True, help='No friend_id provided' )
        args = parser.parse_args()
        try:
            FriendController.remove_friend(user_id, args.get('friendship_id'))
            return {'status' : 'ok'}, 200
        except Exception as e:
            return {'error' : str(e)}
        

class ReplyFriendRequestResource(Resource):
    @auth_required
    def post(self, user_id : str, role : str ):
        parser = reqparse.RequestParser()
        parser.add_argument( 'friendship_id', type=str, required=True, help='No friendship_id provided' )
        parser.add_argument( 'accept', type=bool, required=True, help='No accept provided' )
        args = parser.parse_args()
        try:
            FriendController.request_reply(user_id, args.get('friendship_id'), args.get('accept'))
            return {'status' : 'ok'}, 200
        except Exception as e:
            return {'error' : str(e)}