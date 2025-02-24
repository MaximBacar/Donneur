import { createContext, useState, useContext } from "react";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [userID, setUserID] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  return (
    <UserContext.Provider value={{ userID, setUserID, withdrawAmount, setWithdrawAmount }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);