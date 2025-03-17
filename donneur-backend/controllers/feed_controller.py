from firebase_admin import  db
from datetime       import datetime
from models         import Post, Receiver
from collections import deque

from .friend_controller         import FriendController
from .subscription_controller   import SubscriptionController

class FeedController:

    feed_cache : dict = {}

    class FeedError(Exception):
        class Unauthorized  (Exception) : pass
        class UserNotFound  (Exception) : pass
        class PostNotFound  (Exception) : pass

    def create_post( id : str, content : dict, visibiliy_str : str ) -> Post:

        visibility = Post.PostVisibility(visibiliy_str)

        if not visibility:
            raise Post.PostError.InvalidVisibility('Invalid Visibility')

        post : Post = Post.create( author = id, content = content, visibility = visibility )

        return post

    def delete_post( id : str, post_id : str) -> None:
        
        post    : Post  = Post( post_id )
        author  : str   = post.get_author()

        if id != author:
            raise FeedController.FeedError.Unauthorized()

        post.delete()

    def get_post( post_id : str ) : 
        post : Post = Post ( post_id )
        post_data = post.get()
        if post_data:
            return {post_id : post_data}
        raise FeedController.FeedError.PostNotFound('Post not found')
        

    def __generate_feed( receiver_id : str ) -> dict:

        receiver : Receiver = Receiver(receiver_id)

        if not receiver.exist():
            raise FeedController.FeedError.UserNotFound()
        
        friends         : list = FriendController.get_friends( receiver.id ).get('friends')
        subscriptions   : list = SubscriptionController.get_subscriptions( receiver.id )
       
       
        friend_posts        : dict = {}
        public_posts        : dict = {}
        organization_posts  : dict = {}
        

        for friend in friends:
            friend_posts.update(Post.get_posts(friend.get('friend_id')))

        for subscription in subscriptions:
            organization_posts.update(Post.get_posts(subscription))

        public_posts = Post.get_public_posts()
        public_posts = [item for item in public_posts]


        followed_posts = [key for key, _ in sorted((friend_posts | organization_posts).items(), key=lambda x: datetime.fromisoformat(x[1]))]
 
        feed = []

        chunk_size : int  = 5

        
        for i in range(0, len(followed_posts)):
            feed.append(followed_posts[i])

            if i % chunk_size == 0 and i != 0:
                
                while(True):
                    if len(public_posts) == 0:
                        break
                    public = public_posts.pop(0)
                    if public in followed_posts:
                        continue
                    
                    feed.append(public)
                    break
        
        for public_post in public_posts:
            if public_post not in followed_posts:
                feed.append(public_post)

        FeedController.feed_cache[receiver_id] = feed

    def get_feed( receiver_id : str, page : int = 0):

        result_per_page = 20

        feed : dict = FeedController.feed_cache.get(receiver_id)

        if not feed or page == 0:
            FeedController.__generate_feed(receiver_id)
            feed : dict = FeedController.feed_cache.get(receiver_id)
        
        
        return { 'feed' : feed[page * result_per_page : page * result_per_page + 20] }

    def reply_to_post ( post_id : str, author : str, content : str, visibiliy_str : str ) -> Post:

        visibility  : Post.PostVisibility = Post.PostVisibility(visibiliy_str)

        if not visibility:
            raise Post.PostError.InvalidVisibility()
        
        reply_post  : Post = Post.create( author = author, content = content, visibility = visibility, parent_id = post_id )
        parent_post : Post = Post( post_id )

        parent_post.reply( reply_post.id )

        return reply_post