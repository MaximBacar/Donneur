from    firebase_admin  import  auth, db

def decode_token( token : str) -> dict | None:
    try:
        token_data  : dict          = auth.verify_id_token(token)
        user_uid    : str           = token_data["uid"]

        reference   : db.Reference  = db.reference(f'/users/{user_uid}')
        user_data   : dict          = reference.get()

        return user_data['id'], user_data['role']
    except:
        return None