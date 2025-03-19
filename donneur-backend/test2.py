from controllers import Controller, FeedController, ReceiverController, SubscriptionController, TransactionController, FriendController, OrganizationController
from models import Receiver, Chat, Post, Organization

Controller.initialize()


#FriendController.add_friend('-OLWAVhYVPHyFxcWA7FA', '-OLV8csGtA_3Wc2eLScL')

# a = FriendController.get_friends('-OLV8csGtA_3Wc2eLScL')

# print(a)


# o : Organization = OrganizationController.create_organization(
#     email = 'contact@care.com',
#     password = '1234Test',
#     name = 'Care Montreal',
#     street = '3674 Rue Ontario E',
#     city = 'Montréal',
#     province = 'Quebec',
#     country = 'Canada',
#     postalcode = 'H1W 1R9',
#     max_occupancy = 500,
#     description = 'Refuge pour sans-abri à Montréal, Québec'
# )

# print(o.id)

FeedController.reply_to_post('-OLeAmqkXydM_iDIkhTt', 'OLb2pexbeflLpCaqnJV', {'text' : 'this is the reply'}, 'all')
#FeedController.create_post('-OL_DerRWLhVkVebdg7L', {'text' : 'New to the app'}, 'all')