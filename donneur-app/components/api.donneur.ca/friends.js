import axios from "axios";
import { BACKEND_URL } from "../../constants/backend";

export const getFriends = async ( token ) => {
    let url = `${BACKEND_URL}/friend/get`;
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json',
      }
    });
    return response.data;
          
};

export const addFriend = async (token, friendID) => {
    let url = `${BACKEND_URL}/friend/add`;
    const body = {
      'friend_id' : friendID
    }
    const response = await axios.post(url, body, {
      headers: {
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json',
      }
    });
}

export const removeFriend = async (token, friendID) => {
    let url = `${BACKEND_URL}/friend/remove`;
    const body = {
      'friend_id' : friendID
    }
    const response = await axios.post(url, body, {
      headers: {
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json',
      }
    });
}
export const friendRequestReply = async (token, friendshipID, accept) => {
    let url = `${BACKEND_URL}/friend/reply`;
    const body = {
      'friendship_id'   : friendshipID,
      'accept'          : accept
    }
    const response = await axios.post(url, body, {
      headers: {
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json',
      }
    });
}