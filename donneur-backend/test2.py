from controllers import Controller, FeedController
from models import Receiver, Chat, Post, Organization

Controller.initialize()


# post_content = {
#     'text' : 'First Post 👍🏽'
# }

# post : Post = FeedController.create_post('HAOHbs6LTC', post_content, 'all')

# print(post.id)
# print(post)

# reply_content = {
#     'text' : 'Great 💸'
# }

# r_post : Post = FeedController.reply_to_post( post.id, 'APqwFESL3v', reply_content, 'all')

# print(r_post.id)
# print(r_post)

# post.like('HAOHbs6LTC')
# r_post.like('HAOHbs6LTC')


Organization.create( 
    name='Max Shelter', 
    street='3620 St-Zotiqe E', 
    city='Montreal',
    province='Quebec',
    country='Canada',
    postalcode='h1x1e4',
    max_occupancy=45,
    description='Shelter 2')



