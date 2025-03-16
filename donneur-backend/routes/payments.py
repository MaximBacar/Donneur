from flask_restful  import Resource, reqparse
from routes.routes  import auth_required

class CreateDonationResource(Resource):

    parser = reqparse.RequestParser()
    parser.add_argument('amount', type=int, required=True, help="Amount is required and must be a number.")
    parser.add_argument('receiver_id', type=str, required=True, help="Receiver ID is required.")
    data = parser.parse_args()

    def post(self):
        pass
        

class ConfirmDonationResource(Resource):
    def post(self):
        pass

class CancelDonationResource(Resource):
    def post(self):
        pass

class SendFundsResource(Resource):
    def post(self):
        pass

class WithdrawFundsResource(Resource):
    def post(self):
        pass