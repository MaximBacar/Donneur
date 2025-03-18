from flask_restful          import Resource,        reqparse
from flask                  import request
from routes.authentication  import auth_required

from controllers            import OrganizationController
from models                 import Receiver



class GetOrganizationsResource(Resource):

    def get(self):
        id : str = request.args.get('id')
        try:
            if not id:
                shelters = OrganizationController.get_organizations()
                return shelters
            shelter : dict = OrganizationController.get_organization( id )
            return shelter
        
        except Exception as e:
            return {'error' : str(e)}
        
class GetCurrentOccupancy(Resource):

    @auth_required
    def get(self, user_id : str, role : str):
        
        try:
            return { 'occupancy':OrganizationController.get_occupancy( user_id ) }, 200
        except Exception as e:
            return {'error' : str(e)}, 400

class SetCurrentOccupancy(Resource):
    @auth_required
    def post(self, user_id : str, role : str):

        parser = reqparse.RequestParser()
        parser.add_argument( 'occupancy', type=int, required=True, help="No occupancy provided" )
        args = parser.parse_args()

        try:
            OrganizationController.set_occupancy(user_id, args.get('occupancy'))
            return { 'status': 'ok'}, 200
        except Exception as e:
            return {'error' : str(e)}, 400
        

        
class CreateShelterResource(Resource):

    @auth_required
    def post(self):
        pass