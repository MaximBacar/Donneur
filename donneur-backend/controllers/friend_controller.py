from    firebase_admin  import  db
from    datetime        import  datetime
from    models          import  Receiver

class FriendController:

    BASE_TABLE : str = 'friendships'

    class FriendError(Exception):
        class CannotBefriendHimself (Exception) : pass
        class FriendshipNotFound    (Exception) : pass
        class AlreadyFriends        (Exception) : pass
        class UserNotFound          (Exception) : pass
        class Unauthorized          (Exception) : pass

    def add_friend( user_id : str, friend_id : str) -> tuple[bool, str]:
        
        user    : Receiver = Receiver( user_id )
        friend  : Receiver = Receiver( friend_id)
        
        if user.id == friend.id :
            raise FriendController.FriendError.CannotBefriendHimself()
        
        if (not user.exist()) or (not friend.exist()):
            raise FriendController.FriendError.UserNotFound()
        

        data        : dict = {
            'created_at'    : str(datetime.now()),
            'friends_since' : None,
            'user_1'        : user_id,
            'user_2'        : friend_id
        }

        db.reference(FriendController.BASE_TABLE).push(data)

    def remove_friend( user_id : str, friendship_id : str ) -> bool:

        reference   : db.Reference  = db.reference(FriendController.BASE_TABLE).child(friendship_id)
        friendship  : dict          = reference.get()
        if friendship:
            if (user_id == friendship['user_1']) or (user_id == friendship['user_2']):
                reference.delete()
        

    def request_reply( user_id : str, friendship_id : str, accept : bool = True):

        def accept_request( reference : db.Reference ):
            reference.child('friends_since').set(datetime.now().isoformat())
        def refuse_request():
            FriendController.remove_friend(user_id, friendship_id)

        reference   : db.Reference  = db.reference(FriendController.BASE_TABLE).child(friendship_id)
        friendship  : dict          = reference.get()

        if not friendship:
            raise FriendController.FriendError.FriendshipNotFound()
        
        if friendship.get('friends_since'):
            raise FriendController.FriendError.AlreadyFriends()
        
        if user_id != friendship['user_2']:
            raise FriendController.FriendError.Unauthorized()
    
       
        if accept:
            accept_request(reference)
        else:
            refuse_request()

    def get_friends( user_id : str ) -> dict:

        USERS       : list[str]     = ['user_1', 'user_2']

        requests    : list[dict]    = []
        friends     : list[dict]    = []

        reference   : db.Reference  = db.reference(FriendController.BASE_TABLE)

        for user in USERS:

            query       = reference.order_by_child(user).equal_to(user_id)
            friendships = query.get()

            if not friendships:
                continue

            for friendship_id in friendships:
                if friendships[friendship_id].get('friends_since'):
                    friends.append(
                        {
                            'friend_id'     : friendships[friendship_id][USERS[1]],
                            'friends_since' : friendships[friendship_id]['friends_since'],
                            'friendship_id' : friendship_id
                        }
                    )
                    continue

                if user == USERS[1]:
                    requests.append(
                        {
                            'friend_id'     : friendships[friendship_id][USERS[0]],
                            'created_at'    : friendships[friendship_id]['created_at'],
                            'friendship_id' : friendship_id
                        }
                    )
        return {'requests' : requests, 'friends' : friends} 