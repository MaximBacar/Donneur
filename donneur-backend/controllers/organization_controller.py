from firebase_admin import db
class OrganizationController:
    
    def get_shelters():
        shelters    : list = []
        reference   : db.Reference = db.reference('/organizations')

        shelters_data = reference.get()

        for shelter_data in shelters_data:
            shelters.append(shelters_data[shelter_data])

        return {'shelters' : shelters}