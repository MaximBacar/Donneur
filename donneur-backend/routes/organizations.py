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
        
class CreateShelterResource(Resource):

    @auth_required
    def post(self):
        pass