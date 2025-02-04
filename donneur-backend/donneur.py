from    flask               import Flask

from    firebase_connector  import Database


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
    
    def create_receiver(self):
        return "Added"

    def start(self):
        self.app.run()


a = Donneur()
a.start()