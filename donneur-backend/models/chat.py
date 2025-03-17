from    __future__      import annotations
from    models          import Model
from    datetime        import datetime
from    firebase_admin  import db
class Chat(Model):

    class ChatError(Exception):
        class MemberAlreadyInChat   (Exception) :pass
        class NoChatNameProvided    (Exception) :pass
        class NotEnoughMembers      (Exception) :pass
        class MemberNotInChat       (Exception) :pass
        class UserNotFound          (Exception) :pass

    BASE_TABLE : str = 'chats'

    def __init__(self, id : str):
        super().__init__(id, Chat.BASE_TABLE)

    def create_chat( members : list, name : str = '') -> Chat:

        if len(members) < 2:
            raise Chat.ChatError.NotEnoughMembers()
        if (len(members) > 2) and (not name):
            raise Chat.ChatError.NoChatNameProvided()
        
        reference : db.Reference = db.reference('/chats')
        chat_data = {
            'created_at'    : datetime.now().isoformat(),
            'is_channel'    : False,
            'members'       : members,
            'name'          : name
        }

        chat = reference.push(chat_data)

        return Chat(chat.key) 

    def create_channel( members : list, name : str = '') -> Chat:

        if len(members) < 1:
            raise Chat.ChatError.NotEnoughMembers()
        if not name:
            raise Chat.ChatError.NoChatNameProvided()
        
        reference : db.Reference = db.reference('/chats')
        chat_data = {
            'created_at'    : datetime.now().isoformat(),
            'is_channel'    : True,
            'members'       : members,
            'name'          : name
        }

        channel = reference.push(chat_data)

        return Chat(channel.key) 


    def save_message( self, user_id : str, content : str ) -> None:
        message_data : dict = {
            'user'      : user_id,
            'content'   : content,
            'created_at': datetime.now().isoformat()
        }
        self.reference.child('messages').push(message_data)
    
    def get_messages(self):
        messages : list = self.reference.child('messages').get()
        return messages

    def get_members( self ) -> list[str]:
        members : list = self.reference.child('members').get()
        return members

    def add_member( self , member_id : str) -> None:

        members : list = self.get_members()

        if member_id in members:
            raise Chat.ChatError.MemberAlreadyInChat()
        
        members.append(member_id)
        self.reference.child('members').set(members)

    def remove_member ( self, member_id : str) -> None:
        
        members : list = self.get_members()

        if member_id not in members:
            raise Chat.ChatError.MemberNotInChat    
        
        members.remove(member_id)
        self.reference.child('members').set(members)
