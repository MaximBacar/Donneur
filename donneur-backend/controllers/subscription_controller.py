from firebase_admin import db

class SubscriptionController:
    
    REFERENCE : db.Reference = db.reference(f'/subscriptions')

    def subscribe ( user_id     : str, organization_id : str ):
        SubscriptionController.REFERENCE.child(user_id).child(organization_id).set(True)
    def unsubscribe( user_id    : str, organization_id : str ):
        SubscriptionController.REFERENCE.child(user_id).child(organization_id).delete()