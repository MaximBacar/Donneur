from flask_restful          import Resource,        reqparse
from routes.authentication  import auth_required

from controllers import ReceiverController
from models         import Receiver

import logging

class CreateReceiverResource(Resource):
    @auth_required
    def post(self, user_id : str, role : str ):
        parser = reqparse.RequestParser()
        parser.add_argument( 'first_name', type=str, required=True, help="No first_name provided" )
        parser.add_argument( 'last_name', type=str, required=True, help="No last_name provided" )
        parser.add_argument( 'dob', type=str, required=True, help="No dob provided" )
        data = parser.parse_args()
        try:
            receiver : Receiver = ReceiverController.create_receiver( 
                data.get('first_name'), 
                data.get('last_name'), 
                data.get('dob')
            )
            return { 'receiver_id' : receiver.id }, 200
        except Exception as e:
            logging.error(str(e))
            return {'error' : str(e)}, 400

class AddEmailResource(Resource):
    @auth_required
    def post(self, user_id : str, role : str ):
        parser = reqparse.RequestParser()
        parser.add_argument( 'receiver_id', type=str, required=True, help="No receiver_id provided" )
        parser.add_argument( 'email', type=str, required=True, help="No email provided" )
        data = parser.parse_args()
        try:
            ReceiverController.update_email( 
                data.get('receiver_id'), 
                data.get('email')
            )
            return {'status' : 'ok'}, 200
        except Exception as e:
            return {'error' : str(e)}, 400

class VerifyLinkResource(Resource):

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument( 'receiver_id', type=str, required=True, location='args', help="No receiver_id provided" )
        data = parser.parse_args()

        try:
            valid = ReceiverController.verify_account_creation_link( 
                data.get('receiver_id'), 
            )
            if valid:
                return {'status' : 'ok'}, 200
            return {'status' : 'disabled'}, 400
        except Exception as e:
            return {'error' : str(e)}, 400
        
class CreateAppAccountResource(Resource):

    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument( 'receiver_id', type=str, required=True, help="No receiver_id provided" )
        parser.add_argument( 'password', type=str, required=True, help="No password provided" )
        data = parser.parse_args()

        try:
            ReceiverController.create_app_account(data.get('receiver_id'), data.get('password'))
            return {'status' : 'ok'}, 200
        except Exception as e:
            return {'error' : str(e)}, 400

class BanReceiverResource(Resource):
    def post(self):
        pass

class DonationProfileResource(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument( 'receiver_id', type=str, location='args', required=True, help="No receiver_id provided" )
        data = parser.parse_args()

        try:
            profile : dict = ReceiverController.donation_profile( data.get('receiver_id') )
            return profile, 200
        except Exception as e:
            return {'error' : str(e)}, 400

class GetReceiverResource(Resource):
    @auth_required
    def get(self, user_id : str, role : str ):

        try:
            receiver : dict = ReceiverController.get_receiver( user_id )
            return receiver, 200
        except Exception as e:
            return {'error' : str(e)}, 400
        
class GetBalanceResource(Resource):
    @auth_required
    def get(self, user_id : str, role : str ):
        try:
            receiver : dict = ReceiverController.get_balance( user_id )
            return receiver, 200
        except Exception as e:
            return {'error' : str(e)}, 400
        

class GetReceiverProfile(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument( 'receiver_id', type=str, required=True, location='args', help="No receiver_id provided" )
        arg = parser.parse_args()
        try:
            profile = ReceiverController.get_profile(arg.get('receiver_id'))

            return profile, 200
            
        except Exception as e:
            logging.error(str(e))
            return {'error': str(e)}, 400

