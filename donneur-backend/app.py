from flask                  import Flask
from controllers            import Controller
from flask_restful          import Api
# from flask_socketio         import join_room, leave_room, send, SocketIO

from routes.feed            import GetFeedResource, ReplyToPostResource, CreatePostResource, DeletePostResource, GetPostResource, GetUserPostsResource
from routes.friends         import GetFriendsResource, AddFriendResource, RemoveFriendResource, ReplyFriendRequestResource
from routes.payments        import CreateDonationResource, ConfirmDonationResource, CancelDonationResource
from routes.receivers       import CreateReceiverResource, AddEmailResource, VerifyLinkResource, CreateAppAccountResource, DonationProfileResource, GetReceiverResource, GetBalanceResource 
from routes.transactions    import GetTransactionsResource, SendFundsResource, WithdrawFundsResource
from routes.subscriptions   import SubscribeResource, UnsubscribeResource, GetSubscriptionsResource
from routes.organizations   import GetOrganizationsResource, GetCurrentOccupancy, SetCurrentOccupancy
from routes.authentication  import AuthenticationResource
from routes.medias          import IdDocumentUploadResource, IdPictureUploadResource, BannerUploadResource, LogoUploadResource





Controller.initialize()


app             = Flask(__name__)
app.secret_key  = Controller.flask_secret

api             = Api(app)
# socketio        = SocketIO(app, cors_allowed_origins="*")


api.add_resource(   AuthenticationResource,     '/authenticate'                 )

api.add_resource(   AddFriendResource,          '/friend/add'                   )
api.add_resource(   GetFriendsResource,         '/friend/get'                   )
api.add_resource(   ReplyFriendRequestResource, '/friend/reply'                 )
api.add_resource(   RemoveFriendResource,       '/friend/remove'                )

api.add_resource(   GetReceiverResource,        '/receiver/get'                 )
api.add_resource(   CreateReceiverResource,     '/receiver/create'              )
api.add_resource(   AddEmailResource,           '/receiver/set_email'           )
api.add_resource(   GetBalanceResource,         '/receiver/get_balance'         )
api.add_resource(   VerifyLinkResource,         '/receiver/verify_link'         )
api.add_resource(   CreateAppAccountResource,   '/receiver/create_app_account'  )
api.add_resource(   DonationProfileResource,    '/receiver/donation_profile'    )


api.add_resource(   GetOrganizationsResource,   '/organization/get'             )
api.add_resource(   SetCurrentOccupancy,        '/organization/set_occupancy'   )
api.add_resource(   GetCurrentOccupancy,        '/organization/get_occupancy'   )

api.add_resource(   CreateDonationResource,     '/donation/create'              )
api.add_resource(   CancelDonationResource,     '/donation/cancel'              )
api.add_resource(   ConfirmDonationResource,    '/donation/confirm'             )


api.add_resource(   SubscribeResource,          '/subscription/subscribe'       )
api.add_resource(   UnsubscribeResource,        '/subscription/unsubscribe'     )
api.add_resource(   GetSubscriptionsResource,   '/subscription/get'             )

api.add_resource(   GetTransactionsResource,    '/transaction/get'              )
api.add_resource(   SendFundsResource,          '/transaction/send'             )
api.add_resource(   WithdrawFundsResource,      '/transaction/withdraw'         )

api.add_resource(   IdPictureUploadResource,    '/media/set_id_picture'         )
api.add_resource(   IdDocumentUploadResource,   '/media/set_id_document'        )
api.add_resource(   BannerUploadResource,       '/media/set_banner'             )
api.add_resource(   LogoUploadResource,         '/media/set_logo'               )

api.add_resource(   GetFeedResource,            '/feed'                         ) # get the feed params: start, end
api.add_resource(   GetPostResource,            '/feed/get_post'                ) # get a single post params: post_id
api.add_resource(   CreatePostResource,         '/feed/create'                  ) # create a new post
api.add_resource(   DeletePostResource,         '/feed/delete'                  ) # delete a post params: post_id
api.add_resource(   ReplyToPostResource,        '/feed/reply'                   ) # reply to a post params: post_id
api.add_resource(   GetUserPostsResource,       '/feed/get_user_posts'          ) # reply to a post params: post_id




@app.route('/')
def index():
    return {'ok':'ok'}