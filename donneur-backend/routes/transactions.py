from routes.authentication  import auth_required
from flask_restful          import Resource, reqparse
from controllers            import TransactionController


class WithdrawFundsResource(Resource):
    @auth_required
    def post(self, user_id : str, role : str):
        parser = reqparse.RequestParser()
        parser.add_argument( 'receiver_id', type=str, required=True, help="No receiver_id provided" )
        parser.add_argument( 'amount', type=float, required=True, help="No amount provided" )
        args = parser.parse_args()

        TransactionController.withdraw(args.get('receiver_id'), user_id, args.get('amount'))

class SendFundsResource(Resource):
    @auth_required
    def post(self, user_id : str, role : str):
        parser = reqparse.RequestParser()
        parser.add_argument( 'receiver_id', type=str, required=True, help="No receiver_id provided" )
        parser.add_argument( 'amount', type=float, required=True, help="No amount provided" )
        args = parser.parse_args()

        TransactionController.send(args.get('receiver_id'), user_id, args.get('amount'))

class GetTransactionsResource(Resource):
    @auth_required
    def get(self, user_id : str, role : str):
        try:
            transactions = TransactionController.get_transactions( user_id )
            return {'transactions' : transactions}, 200
        except Exception as e:
            return { 'error' : str(e) }, 400
