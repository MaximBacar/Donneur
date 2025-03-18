from flask_restful  import Resource,        reqparse
from routes.authentication  import auth_required
from controllers    import SubscriptionController

class SubscribeResource(Resource): 
    @auth_required
    def post( self, user_id : str, role : str  ):

        parser = reqparse.RequestParser()
        parser.add_argument( 'organization_id', type=str, required=True, help="No organization_id provided" )
        
        data = parser.parse_args()
        try:
            SubscriptionController.subscribe( user_id, data.get('organization_id') )
            return {'status':'ok'}, 200
        except Exception as e:
            return {'error' : str(e)}
        
class UnsubscribeResource(Resource): 
    @auth_required
    def post( self, user_id : str, role : str  ):

        parser = reqparse.RequestParser()
        parser.add_argument( 'organization_id', type=str, required=True, help="No organization_id provided" )
        
        data = parser.parse_args()
        try:
            SubscriptionController.unsubscribe( user_id, data.get('organization_id') )
            return {'status':'ok'}, 200
        except Exception as e:
            return {'error' : str(e)}, 400
        
class GetSubscriptionsResource(Resource):
    @auth_required
    def get( self, user_id : str, role : str  ):

        try:
            subscriptions : list = SubscriptionController.get_subscriptions( user_id )
            return { 'subscriptions' : subscriptions }, 200
        except Exception as e:
            return {'error' : str(e)}, 400