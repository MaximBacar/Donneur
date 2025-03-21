from flask_restful  import  Resource, reqparse
from controllers    import  PaymentController
import logging
class CreateDonationResource(Resource):

    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument(    'amount',       type=float, required=True, help="Amount is required and must be a number."    )
        parser.add_argument(    'receiver_id',  type=str, required=True, help="Receiver ID is required."                    )
        
        data = parser.parse_args()

        try:
            client_secret = PaymentController.create_payment( data.get('receiver_id'), data.get('amount'))

            return { 'client_secret' : client_secret }, 200
        except Exception as e:
            return { 'error' : str(e) }, 400
        

class ConfirmDonationResource(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument(    'data',       type=dict, required = False    )
        args = parser.parse_args()
        try:
            logging.debug(args)
            
            payment_intent = args['data']['object']
            PaymentController.confirm_payment( payment_intent )
            return {"status" : "ok"}, 200
        
        except Exception as e:
            logging.error(str(e))
            return {'error' : str(e)}, 400
        
class CancelDonationResource(Resource):
    def post(self):
        try:
            PaymentController.cancel_payment()
            return {"status": "ok"}, 200
        except Exception as e:
            return {'error' : str(e)}, 400