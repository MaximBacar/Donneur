from firebase_admin import  db
from datetime       import datetime
from models         import Post, Receiver, Organization
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
    

    def __get_author( author_id : str ):
        user = Receiver(author_id)
        if not user.exist():
            user = Organization( author_id )
        
        author_data : dict = user.get()

        if not author_data:
            return None

        if isinstance(user, Organization):
            pic =  author_data.get("logo_file")
            author = {
                'name' : author_data.get('name'),
                'picture_id' : pic if pic else 'https://appalachiantrail.org/wp-content/uploads/2020/02/Deep-Gap-Shelter.jpg',
                'id'        : author_id
            }
        else:
            pic = author_data.get("id_picture_file"),
            author = {
                'name' : f'{author_data.get("first_name")} {author_data.get("last_name")[0]}.',
                'picture_id' :  pic if pic else '',
                'id'        : author_id
            }

        return author
        

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
        public_posts : list = [item for item in public_posts]
        public_posts.reverse()
        
        friend_and_subsciption_posts = friend_posts | organization_posts

        followed_posts = [key for key, _ in sorted((friend_and_subsciption_posts).items(), key=lambda x: datetime.fromisoformat(x[1]))]
        #followed_posts.reverse()
        feed = []

        chunk_size : int  = 5

        
        for i in range(0, len(followed_posts)):
            feed.append(followed_posts[i])

            print(followed_posts[i])

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
        
        
        feed = feed[page * result_per_page : page * result_per_page + 20]
        feed_data = []
        for i, post_id in enumerate(feed):
            post_data : dict = Post(post_id).get()
            post_data['id'] = post_id

            author = FeedController.__get_author(post_data['author'])
            if not author:
                continue
            if author.get('id') == receiver_id:
                continue
            post_data['author'] = author

            feed_data.append(post_data)

        return { 'feed' : feed_data }

    def reply_to_post ( post_id : str, author : str, content : str, visibiliy_str : str ) -> Post:

        visibility  : Post.PostVisibility = Post.PostVisibility(visibiliy_str)

        if not visibility:
            raise Post.PostError.InvalidVisibility()
        
        reply_post  : Post = Post.create( author = author, content = content, visibility = visibility, parent_id = post_id )
        parent_post : Post = Post( post_id )

        parent_post.reply( reply_post.id )

        return reply_post
    
    def get_user_posts ( receiver_id : str ):
        posts = Post.get_posts( receiver_id )
        posts : list = [key for key, _ in sorted((posts).items(), key=lambda x: datetime.fromisoformat(x[1]))]

        author = FeedController.__get_author( receiver_id )

        user_posts = []

        for post_id in posts:
            post_data : dict = Post(post_id).get()
            post_data['id'] = post_id
            post_data['author'] = author

            user_posts.append(post_data)
        
        return {'posts' : user_posts}
        
        