from firebase_admin import db
class Model:

    def __init__(self, id : str, base_table : str ):
        self.id : str = id
        self.reference : db.Reference = db.reference(f'/{base_table}/{id}')

    def get( self ) -> dict:
        return self.reference.get()
    
    def exist( self ) -> bool:
        if self.reference.get():
            return True
        return False