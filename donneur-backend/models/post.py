from    __future__      import annotations
from    firebase_admin  import db
from    datetime        import datetime
from    models          import Model
import  enum
class Post(Model):


    BASE_TABLE : str = 'posts'

    class PostVisibility(enum.Enum):
        HOMELESS_ONLY   = 'receiver'
        FRIENDS_ONLY    = 'friends'
        ALL             = 'all'
    
    class PostError(Exception):
        class InvalidVisibility (Exception) : pass
        class PostAlreadyLiked  (Exception) : pass
        class PostWasNotLiked   (Exception) : pass
        class ReplyNotFound     (Exception) : pass
        class PostNotFound      (Exception) : pass

    def __init__(self, id : str):
        super().__init__(id, Post.BASE_TABLE)

    def create( author : str, content : dict, visibility : Post.PostVisibility, parent_id : str = None) -> Post:
        reference = db.reference(Post.BASE_TABLE)
        post_data = {
            'created_at'    : datetime.now().isoformat(),
            'visibility'    : visibility.value,
            'parent_id'     : parent_id,
            'content'       : content,
            'author'        : author,
            'likes'         : []
            
        }
        post = reference.push(post_data)

        return Post( post.key )
    

    def __delete( post_id : str ):

        # Get Post from db
        post_reference  : db.Reference  = db.reference(f'/{Post.BASE_TABLE}/{post_id}')
        post            : dict | None   = post_reference.get()

        if not post:
            raise Post.PostError.PostNotFound()

        parent_id       : str   | None  = post.get('parent_id')
        replies         : dict  | None  = post.get('replies')

        if parent_id:
            parent_reference = db.reference(f'/{Post.BASE_TABLE}/{parent_id}/replies/{post_id}')
            parent_reference.delete()
        
        if replies:
            for reply_post in replies:
                Post.__delete( reply_post )
        
        post_reference.delete()

    def delete ( self ):
        
        Post.__delete( self.id )

    def reply( self, reply_id : str ):

        reply_reference : db.Reference = self.reference.child('replies').child(reply_id)
        reply_reference.set(True)

    def remove_reply ( self, reply_id : str ):
        
        reply_reference = self.reference.child('replies').child(reply_id)

        if not reply_reference.get():
            raise Post.PostError.ReplyNotFound()
        
        reply_reference.delete()

    def like( self, user_id : str ):

        like_reference : db.Reference = self.reference.child('likes').child(user_id)

        if like_reference.get():
            raise Post.PostError.PostAlreadyLiked()
        
        like_reference.set(True)


    def remove_like( self, user_id : str):

        like_reference : db.Reference = self.reference.child('likes').child(user_id)

        if not like_reference.get():
            raise Post.PostError.PostWasNotLiked()
        
        like_reference.delete()

    def get_replies( self ) -> dict | None :

        replies_reference = self.reference.child('replies')
        return replies_reference.get()
    
    def get_parent( self ) -> str | None :

        parent_reference = self.reference.child('parent_id')
        return parent_reference.get()
    
    def get_author( self ) -> str :
        
        author_reference = self.reference.child('author')
        return author_reference.get()