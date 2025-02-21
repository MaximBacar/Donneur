import { createContext, useState, useContext } from "react";

const FriendContext = createContext(null);

export const FriendProvider = ({ children }) => {
  const [newFriendID, setNewFriendID] = useState(null);
  const [newFriendUID, setNewFriendUID] = useState(null);

  return (
    <FriendContext.Provider value={{ newFriendID, setNewFriendID,  newFriendUID, setNewFriendUID}}>
      {children}
    </FriendContext.Provider>
  );
};

export const useFriend = () => useContext(FriendContext);