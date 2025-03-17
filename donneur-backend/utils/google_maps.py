import  requests
import  urllib.parse
from    controllers     import Controller


class GoogleMaps:

    BASE_URL : str = 'https://maps.googleapis.com/maps/api/geocode/json?address={}&key={}'

    def coordinates_from_address ( address : str ) -> tuple[float, float]:

        response    : requests.Response = requests.get( GoogleMaps.BASE_URL.format( urllib.parse.quote(address), Controller.google_key) )

        geo_data    : dict              = response.json()
        coordinates : dict              = geo_data['results'][0]['geometry']['location']
        
        return (coordinates['lat'], coordinates['lng'])