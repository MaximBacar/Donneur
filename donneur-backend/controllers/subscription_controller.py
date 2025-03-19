from firebase_admin import db
from models         import Receiver, Organization


class SubscriptionController:
    
    BASE_TABLE : str = 'subscriptions'

    class SubscriptionError(Exception):
        class ReceiverNotFound      (Exception) :pass
        class OrganizationNotFound  (Exception) :pass

    def subscribe ( receiver_id : str, organization_id : str ) -> None:
        print("SUB")
        receiver        : Receiver      = Receiver      ( receiver_id )
        organization    : Organization  = Organization  ( organization_id )
        if not receiver.exist():
            raise SubscriptionController.SubscriptionError.ReceiverNotFound('Receiver not found')
        if not organization.exist():
            raise SubscriptionController.SubscriptionError.OrganizationNotFound('Organization not found')
        
        db.reference(SubscriptionController.BASE_TABLE).child(receiver.id).child(organization.id).set(True)

    def unsubscribe( receiver_id : str, organization_id : str ) -> None:
        print("UNSUB")
        receiver        : Receiver      = Receiver      ( receiver_id )
        organization    : Organization  = Organization  ( organization_id )
        if not receiver.exist():
            raise SubscriptionController.SubscriptionError.ReceiverNotFound('Receiver not found')
        if not organization.exist():
            raise SubscriptionController.SubscriptionError.OrganizationNotFound('Organization not found')
        
        db.reference(SubscriptionController.BASE_TABLE).child(receiver.id).child(organization.id).delete()

    def get_subscriptions( receiver_id : str ) -> list:

        receiver        : Receiver  = Receiver ( receiver_id )
        subscriptions   : list      = []

        if not receiver.exist():
            raise SubscriptionController.SubscriptionError.ReceiverNotFound('Receiver not found')
        
        subscription_data : dict = db.reference(SubscriptionController.BASE_TABLE).child(receiver.id).get()

        if subscription_data:
            for subscription in subscription_data:
                subscriptions.append(subscription)

        return subscriptions