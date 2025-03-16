from    firebase_admin          import  auth,   db
from    controllers             import  decode_token
from    flask                   import  request
def auth_required(func):
   
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return {'error': 'Missing or invalid authorization header'}, 401
        
        token = auth_header.split('Bearer ')[1]
        user_id = decode_token(token)

        if user_id:
            return func(args[0], user_id, *args[1:], **kwargs)
        
        return {'error': f'Invalid token'}, 401
    
            
    wrapper.__name__ = func.__name__ 
    return wrapper