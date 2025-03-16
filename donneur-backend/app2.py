from flask_socketio import join_room, leave_room, send, SocketIO
from routes.friend  import GetFriendsResource, AddFriendResource
from flask_restful  import Api
from controllers    import Controller
from flask          import Flask







controller = Controller()

app             = Flask(__name__)
app.secret_key  = controller.flask_secret

api             = Api(app)
socketio        = SocketIO(app, cors_allowed_origins="*")


api.add_resource(AddFriendResource, '/add_friend')
api.add_resource(GetFriendsResource, '/get_friends')

@app.route('/')
def index():
    return {'ok':'ok'}

if __name__ == '__main__':
    socketio.run( app, host='0.0.0.0', port=5005, debug = True )