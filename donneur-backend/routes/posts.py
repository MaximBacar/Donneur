from flask_restful  import Resource, reqparse

from routes.routes  import auth_required

class CreatePostResource(Resource):
    @auth_required
    def post(self):
        pass

class DeletePostResource(Resource):
    @auth_required
    def post(self):
        pass

class CreatePostEventResource(Resource):
    @auth_required
    def post(self):
        pass

class CreatePostPollResource(Resource):
    @auth_required
    def post(self):
        pass

class UploadPostMediaResource(Resource):
    @auth_required
    def post(self):
        pass