from flask_restful  import Resource, reqparse
from routes.routes  import auth_required

class GetFeedResource(Resource):
    @auth_required
    def get(self):
        pass