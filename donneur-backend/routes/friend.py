from flask_restful  import Resource, reqparse

from routes.routes  import auth_required
from controllers    import friend_controller

class GetFriendsResource(Resource):
    @auth_required
    def get(self, user_id : str ):
        friends = friend_controller.get_friends(user_id)
        return friends, 200

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