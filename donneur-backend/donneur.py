from    flask               import Flask

from    firebase_connector  import Database

app = Flask(__name__)


class Donneur():
    
    def __init__(self):
        self.app        = Flask(__name__)
        self.database   = Database()
        
        self.app.add_url_rule(  "/",          "index",    self.index    )
        self.app.add_url_rule(  "/api/docs",  "docs",     self.docs     )

    def index(self):
        return "Donneur.ca API"

    def docs(self):
        return "Donneur.ca API Docs"

    def start(self):
        self.app.run()

def start():
    firebase_credentials = credentials.Certificate('/Users/maximbacar/Downloads/capstone-3828a-firebase-adminsdk-fbsvc-fe22bd393f.json')
    firebase_admin.initialize_app(credential = firebase_credentials)

    app.run( debug = True )


# @app.route( '/' )
# def index():
#     return "Donneur.ca API"

# @app.route( '/api/docs' )
# def docs():
#     return "Donneur.ca API Docs"





# if __name__ == '__main__':
#     start()


a = Donneur()
a.start()