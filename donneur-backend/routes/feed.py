from flask_restful          import Resource, reqparse
from routes.authentication  import auth_required

from controllers    import FeedController
from models         import Post

import logging

class CreatePostResource(Resource):

    @auth_required
    def post(self, user_id : str, role : str ):

        parser = reqparse.RequestParser()
        parser.add_argument(    'content',      type=dict,  required=True, help="Post need a content"       )
        parser.add_argument(    'visibility',   type=str,   required=True, help="Post need a visibility"    )
        
        data = parser.parse_args()
        try:
            
            post : Post = FeedController.create_post( user_id, data.get('content'), data.get('visibility') )
            return {'post' : post.id}, 201
        except Exception as e:
            print('error : ', e)
            return {'error' : str(e)}, 400
        
class DeletePostResource(Resource):

    @auth_required
    def post(self, user_id : str, role : str ):
        parser = reqparse.RequestParser()
        parser.add_argument(    'post_id',      type=dict,  required=True, help="No post_id provided"       )
        
        data = parser.parse_args()

        try:
            FeedController.delete_post( user_id, data.get('post_id') )
            return {'status' : 'success'}, 200
        except Exception as e:
            return {'error' : str(e)}, 400
        
class GetPostResource(Resource):

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('post_id', type=dict, required=True, help="No post_id provided")
        data = parser.parse_args()
        try:
            post = FeedController.get_post(data.get('post_id'))
            return post
        except Exception as e:
            return {'error' : str(e)}
        
class GetFeedResource(Resource):
    
    @auth_required
    def get( self, user_id, role : str ):
        try:
            feed = FeedController.get_feed( user_id )
            return feed
        except Exception as e:
            print(str(e))
            return {'error' : str(e)}
        
class ReplyToPostResource(Resource):

    @auth_required
    def post(self, user_id : str, role : str ):
        parser = reqparse.RequestParser()
        parser.add_argument(    'post_id',      type=dict,  required=True, help="No post_id provided"       )
        parser.add_argument(    'content',      type=dict,  required=True, help="Post need a content"       )
        parser.add_argument(    'visibility',   type=str,   required=True, help="Post need a visibility"    )
        
        data = parser.parse_args()

        try:
            post : Post = FeedController.reply_to_post( data.get('post_id'), user_id, data.get('content'), data.get('visibility'))
            return { 'post' : post.id }, 201
        except Exception as e:
            return { 'error' : str(e) }, 400
        
class GetUserPostsResource(Resource):

    @auth_required
    def get(self, user_id : str, role : str):
        try:
            user_posts = FeedController.get_user_posts(user_id)
            return user_posts, 200
        except Exception as e:
            logging.error(str(e))
            return {'error' : str(e)}, 400

