from flask import Flask
from Database.services import get_receiver, get_sender
from Database.base import Base, engine


app = Flask(__name__)


@app.route( '/' )
def index():
    return "Donneur.ca API"

if __name__ == '__main__':
    app.run( debug = True )