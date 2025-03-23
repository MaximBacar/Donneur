import React, { createContext, useContext, useState, useEffect } from "react";
import { Text } from "react-native";

import { getTransactions }  from "../../components/api.donneur.ca/transactions";
import { getUserInfo }      from "../../components/api.donneur.ca/user";
import { getFriends }       from "../../components/api.donneur.ca/friends";
import { useAuth }          from "../../context/authContext";
const ReceiverContext = createContext();


export const ReceiverProvider = ({ children }) => {

    const { user, donneurID } = useAuth();

    const   [   id,             setID           ] = useState(null);
    const   [   feed,           setFeed         ] = useState(null);
    const   [   friends,        setFriends      ] = useState(null);
    const   [   loading,        setLoading      ] = useState(true);
    const   [   userInfo,       setUserInfo     ] = useState(null);
    const   [   transactions,   setTransactions ] = useState(null);

    const updateUserInfo = async () => {
        const data = await getUserInfo(await user.getIdToken());
        setUserInfo(data);
    }
    const updateTransactions = async () => {
        console.log('grrrrr');
        const data = await getTransactions(await user.getIdToken(), donneurID);
        console.log(data)
        console.log('rddd')
        setTransactions(data);
        return data
    }

    const updateFriends = async () => {
        const data = await getFriends( await user.getIdToken());
        setFriends(data);
    }

    const updateFeed = async () => {
        
    }
    
    useEffect(() => {
        const loadData = async () => {
            
            await updateTransactions();
            await updateFriends();
            await updateUserInfo();
            setLoading(false);
        }

        loadData();
    }, []);

    const values = {
        loading, 
        userInfo, 
        updateUserInfo, 
        friends, 
        updateFriends, 
        transactions, 
        updateTransactions,
        feed,
        updateFeed
    }
    if (loading) {
        return <Text>Loading</Text>
    }
    return (
        <ReceiverContext.Provider value={values}>
            {children}
        </ReceiverContext.Provider>
    );
};

export const useReceiver = () => useContext(ReceiverContext);