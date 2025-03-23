import { BACKEND_URL } from "../../constants/backend";
import axios from "axios";

export const authenticate = async ( token ) => {
    console.log(BACKEND_URL);
    let url = `${BACKEND_URL}/authenticate`;
    const response = await axios.get(url, {
    headers: {
        'Authorization' : `Bearer ${token}`, 
        'Content-Type'  : 'application/json',
        "ngrok-skip-browser-warning": "69420"
    }
    });
    return response.data;
}
