import { BACKEND_URL } from "../../constants/backend";
import axios from "axios";

export const getUserInfo = async ( token ) => { 
    let url = `${BACKEND_URL}/receiver/get`;
    const response = await axios.get(url, {
        headers: {
            'Authorization' : `Bearer ${token}`,
            'Content-Type'  : 'application/json',
        }
    });
    return response.data;
};