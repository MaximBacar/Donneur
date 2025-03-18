from flask_restful  import Resource, reqparse

from routes.routes  import auth_required
from controllers    import FriendController

class GetFriendsResource(Resource):
    @auth_required
    def get( self, user_id : str ):
        try:
            friends = FriendController.get_friends(user_id)
            return friends, 200
        except Exception as e:
            return {'error' : str(e)}

class AddFriendResource(Resource):
    @auth_required
    def post(self):
        pass

class RemoveFriendResource(Resource):
    @auth_required
    def post(self):
        pass

class ReplyFriendRequestResource(Resource):
    @auth_required
    def post(self):
        pass