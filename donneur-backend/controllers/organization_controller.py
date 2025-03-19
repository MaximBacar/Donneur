from firebase_admin import db, auth
from models         import Organization

class OrganizationController:

    class OrganizationError(Exception):
        class OrganizationNotFound(Exception) : pass
    
    def get_organizations() -> dict:

        shelters    : list = []
        reference   : db.Reference = db.reference('/organizations')

        return {'shelters' : reference.get()}
    
    def get_organization( organization_id : str) -> dict:
        organization : Organization = Organization( organization_id )
        data =  organization.get()

        if data:
            data['id'] = organization_id
            return data
        
        raise OrganizationController.OrganizationError.OrganizationNotFound()
    
    def set_occupancy ( organization_id : str, occupancy : int):
        organization : Organization = Organization( organization_id )
        organization.set_occupancy(occupancy)

    def get_occupancy ( organization_id : str) -> int:
        organization : Organization = Organization( organization_id )
        return organization.get_occupancy()
    
    def set_info( 
        org_id: str, 
        phone: str,
        name: str ,
        description: str, 
        street: str,
        city: str, 
        state: str,
        postalcode: str,
        max_occupancy: int,
        apt: str = ""
    ):
        org: Organization = Organization(org_id)

        if not org.exist():
            raise ValueError("OrgNotFound")

        org.set_address(street, postalcode, city, state, 'Canada', apt)

        ref = db.reference(f'/organizations/{org_id}')


        ref.child('phone').set(phone)
        ref.child('name').set(name)
        ref.child('description').set(description)
        ref.child('max_occupancy').set(max_occupancy)



        
    def create_organization(
            email           : str,
            password        : str,
            name            : str, 
            street          : dict  = None, 
            apt             : str   = None,
            city            : str   = None, 
            country         : str   = None, 
            province        : str   = None,
            postalcode      : str   = None,
            max_occupancy   : int   = None, 
            banner_file     : str   = None, 
            logo_file       : str   = None, 
            description     : str   = None
            ):
        
        organization : Organization = Organization.create(name, street, apt, city, country, province, postalcode, max_occupancy, banner_file, logo_file, description)

        users_reference = db.reference('users')
        firebase_user : auth.UserRecord = auth.create_user (
                email       = email,
                password    = password,
        )

        users_reference.child(firebase_user.uid).set(
            {
                'id'    : organization.id,
                'role'  : 'organization'
            }
        )

        return organization