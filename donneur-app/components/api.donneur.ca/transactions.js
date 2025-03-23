import { BACKEND_URL } from "../../constants/backend";
import axios from "axios";
export const getTransactions = async (token, id) => {
            
    let url = `${BACKEND_URL}/transaction/get`;
    const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json'
        }
    });  
    const formattedTransactions = response.data.transactions.map(transaction => {
   
        const date = new Date(transaction.creation_date);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        
        const isReceived = transaction.receiver_id === id;
    
  
        let description;
    
        switch(transaction.type){
        case 'donation':
            description = 'Anonymous Donation';
            break;
        case 'withdrawal':
            description = `Withdrawal at ${transaction.receiver_id}`;
            break;
        case 'send':
            description = isReceived ? `Payment received from ${transaction.sender_id}` : `Payment sent to ${transaction.sender_id}`
            break;
        }
      
        return {
            id:             transaction.id,
            raw:            transaction,
            date:           formattedDate,
            type:           isReceived ? 'deposit' : 'withdrawal',
            amount:         isReceived ? transaction.amount : - transaction.amount,
            rawDate:        date,
            category:       transaction.type || 'transfer',
            timestamp:      formattedTime,
            reference:      transaction.id,
            description:    description
        };
    });

    return formattedTransactions;
};