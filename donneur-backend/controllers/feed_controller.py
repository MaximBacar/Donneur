from firebase_admin  import  db
from models import Post

class FeedController:

    class FeedError(Exception):
        class Unauthorized  (Exception) : pass

    def create_post( id : str, content : dict, visibiliy_str : str ) -> Post:
        visibility = Post.PostVisibility(visibiliy_str)
        print(visibility)
        if not visibility:
            raise Post.PostError.InvalidVisibility()

        post : Post = Post.create( author = id, content = content, visibility = visibility )

        return post

    def delete_post( id : str, post_id : str):
        

        post    : Post  = Post( post_id )
        author  : str   = post.get_author()

        if id != author:
            raise FeedController.FeedError.Unauthorized()

        post.delete()

    def get_feed( id : str, results : tuple = (0, 20)):

        # retrieve friends
        # retrieve subscribed shetlers

        # get post of friends
        # get post of shelters
        # get public post

        # order by time


        pass



    def reply_to_post ( post_id : str, author : str, content : str, visibiliy_str : str ):

        visibility = Post.PostVisibility(visibiliy_str)

        if not visibility:
            raise Post.PostError.InvalidVisibility()
        
        reply_post  : Post = Post.create( author = author, content = content, visibility = visibility, parent_id = post_id )
        
        parent_post : Post = Post( post_id )

        parent_post.reply( reply_post.id )

        return reply_post