from firebase_admin     import db
from models             import Model
from utils              import GoogleMaps
import logging
class Organization(Model):

    BASE_TABLE : str = 'organizations'
    def __init__(self, id : str):
        super().__init__( id, Organization.BASE_TABLE )

    
    def create( 
            name            : str, 
            phone           : str   = None,
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

        reference : db.Reference = db.reference(Organization.BASE_TABLE)

        organization_data : dict = {
            'max_occupancy' : max_occupancy,
            'occupancy'     : 0,
            'phone'         : phone,
            'banner_file'   : banner_file,
            'description'   : description,
            'logo_file'     : logo_file,
            'occupancy'     : 0,
            'name'          : name
        }

        
        organization_ref    : db.Reference = reference.push(organization_data)
        organization        : Organization = Organization( organization_ref.key )
        
        if street and postalcode and city and province and country:
            organization.set_address( street, postalcode, city, province, country, apt )

        return organization
    

    def set_occupancy(self, occupancy : int):

        self.reference.child('occupancy').set(occupancy)

    def get_occupancy(self) -> int:

        return self.reference.child('occupancy').get()
    

    def set_address( self, street : str, postalcode : str, city : str, province : str, country : str, apt : str = None ):

        address_line    : str = f'{street} {city}, {province} {postalcode}'

        address_data    : dict = {
            'apt'           : apt,
            'city'          : city,
            'street'        : street,
            'country'       : country,
            'state'         : province,
            'postalcode'    : postalcode
        }

        try:
            address_data['latitude'], address_data['longitude'] = GoogleMaps.coordinates_from_address( address_line )
        except Exception as e:
            logging.error(str(e))
            
        self.reference.child('address').set(address_data)

        