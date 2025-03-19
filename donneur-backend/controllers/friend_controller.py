from    firebase_admin  import  db
from    datetime        import  datetime
from    models          import  Receiver

class FriendController:

    BASE_TABLE : str = 'friendships'

    class FriendError(Exception):
        class CannotBefriendHimself (Exception) : pass
        class AlreadyFriends        (Exception) : pass
        class FriendshipNotFound    (Exception) : pass
        class AlreadyFriends        (Exception) : pass
        class UserNotFound          (Exception) : pass
        class Unauthorized          (Exception) : pass

    def __already_friends( user_1 : str, user_2 : str):

        friendships = FriendController.get_friends(user_1)

        for friendship_type in friendships:
            for friendship in friendships[friendship_type]:
                if user_2 == friendship['user_1'] or user_2 == friendship['user_2']:
                    return True
                
        return False
    
    def friend_profile( friend_id : str , friendship : dict):
        friend  : Receiver  = Receiver(friend_id)
        data    : dict      = friend.get()

        friends_since = friendship.get('friends_since')
        friendship_id = friendship.get('friendship_id')
        print()
        if friends_since:
            friends_since = datetime.fromisoformat( friends_since ).strftime('%B %d, %Y')
        
        profile = {
            'id'            : friend.id,
            'last_name'     : data.get('last_name'),
            'first_name'    : data.get('first_name'),
            'picture_id'    : data.get('id_picture_file'),
            'friends_since' : friends_since,
            'friendship_id' : friendship_id
        }
        return profile


    def add_friend( user_id : str, friend_id : str) -> None:
        
        user    : Receiver = Receiver( user_id )
        friend  : Receiver = Receiver( friend_id)

        if FriendController.__already_friends(user.id, friend.id):
            raise FriendController.FriendError.AlreadyFriends('Already friends')
        
        if user.id == friend.id :
            raise FriendController.FriendError.CannotBefriendHimself()
        
        if (not user.exist()) or (not friend.exist()):
            raise FriendController.FriendError.UserNotFound()
        

        data : dict = {
            'created_at'    : datetime.now().isoformat(),
            'friends_since' : None,
            'user_1'        : user_id,
            'user_2'        : friend_id
        }

        db.reference(FriendController.BASE_TABLE).push(data)

    def remove_friend( user_id : str, friendship_id : str ) -> None:

        reference   : db.Reference  = db.reference(FriendController.BASE_TABLE).child(friendship_id)
        friendship  : dict          = reference.get()
        if not friendship:
            raise FriendController.FriendError.FriendshipNotFound('Friendship not found')
        
        if (user_id != friendship['user_1']) and (user_id != friendship['user_2']):
            raise FriendController.FriendError.Unauthorized()
        
        reference.delete()
            
    def request_reply( user_id : str, friendship_id : str, accept : bool = True) -> None:

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

    def __get_friendships( user_id : str ) -> dict:

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
                            'friend_id'     : friendships[friendship_id][USERS[1]] if user == USERS[0] else friendships[friendship_id][USERS[0]] ,
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
    

    def get_friends( user_id : str ) -> dict:
        print(user_id)
        friendships : dict = FriendController.__get_friendships(user_id)

        print(friendships)
        friends = {'requests' : [], 'friends' : []} 

        for friendship_type in friendships:
            print(friendship_type)
            for friendship in friendships.get(friendship_type):
                friend_profile : dict = FriendController.friend_profile(friendship.get('friend_id'),friendship)
                friends[friendship_type].append(friend_profile)
        return friends