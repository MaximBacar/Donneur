from flask                  import Flask
from controllers            import Controller
from flask_restful          import Api
from flask_socketio         import join_room, leave_room, send, SocketIO


from routes.friend          import GetFriendsResource, AddFriendResource
from routes.payments        import CreateDonationResource, ConfirmDonationResource, CancelDonationResource
from routes.subscriptions   import SubscribeResource, UnsubscribeResource, GetSubscriptionsResource
from routes.feeds           import GetFeedResource, ReplyToPostResource, CreatePostResource, DeletePostResource, GetPostResource
from routes.receivers       import CreateReceiverResource, AddEmailResource, VerifyLinkResource, CreateAppAccountResource, DonationProfileResource 








Controller.initialize()


app             = Flask(__name__)
app.secret_key  = Controller.flask_secret

api             = Api(app)
socketio        = SocketIO(app, cors_allowed_origins="*")


api.add_resource(   AddFriendResource,          '/friend/add'                   )
api.add_resource(   GetFriendsResource,         '/friend/get'                   )

api.add_resource(   CreateReceiverResource,     '/receiver/create'              )
api.add_resource(   AddEmailResource,           '/receiver/set_email'           )
api.add_resource(   VerifyLinkResource,         '/receiver/verify_link'         )
api.add_resource(   CreateAppAccountResource,   '/receiver/create_app_account'  )
api.add_resource(   DonationProfileResource,    '/receiver/donation_profile'    )

api.add_resource(   CreateDonationResource,     '/donation/create'              )
api.add_resource(   CancelDonationResource,     '/donation/cancel'              )
api.add_resource(   ConfirmDonationResource,    '/donation/confirm'             )


api.add_resource(   SubscribeResource,          '/subscription/subscribe'       )
api.add_resource(   UnsubscribeResource,        '/subscription/unsubscribe'     )
api.add_resource(   GetSubscriptionsResource,   '/subscription/get'             )


api.add_resource(   GetFeedResource,            '/feed'                     ) # get the feed params: start, end
api.add_resource(   GetPostResource,            '/feed/get_post'            ) # get a single post params: post_id
api.add_resource(   CreatePostResource,         '/feed/create'              ) # create a new post
api.add_resource(   DeletePostResource,         '/feed/delete'              ) # delete a post params: post_id
api.add_resource(   ReplyToPostResource,        '/feed/reply'               ) # reply to a post params: post_id

@app.route('/')
def index():
    return {'ok':'ok'}

if __name__ == '__main__':
    socketio.run( app, host='0.0.0.0', port=5005, debug = True )