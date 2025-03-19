from    flask_restful           import  Resource, reqparse
from    controllers             import  decode_token
from    flask                   import  request
from    models                  import  User


def auth_required(func):
   
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return {'error': 'Missing or invalid authorization header'}, 401
        
        token = auth_header.split('Bearer ')[1]
        user_id, role = decode_token(token)

        if user_id:
            return func(args[0], user_id, role,  *args[2:], **kwargs)
        
        
        return {'error': f'Invalid token'}, 401
    
            
    wrapper.__name__ = func.__name__ 
    return wrapper

class AuthenticationResource(Resource):
    @auth_required
    def get(self, user_id : str, role : str ):
        user : User = User.get_user(user_id)
        return {'id' : user_id, 'role' : role, 'data' : user.get()}
