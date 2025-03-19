import { useParams }    from "react-router-dom";
import React, { useEffect, useState } from 'react';
import { loadStripe } from "@stripe/stripe-js/pure";


import PaymentButton    from "./components/PaymentButton/paymentButton";
import Profile          from "./components/Profile/profile"; 
import Total            from "./components/Total/total";
import Pad              from "./components/DigitPad/pad";
import Checkout         from "./components/Checkout/checkout";


import PaymentTab from "./components/PaymentTab/paymentTab";

loadStripe.setLoadParameters({advancedFraudSignals: false});
const stripePromise = loadStripe("pk_test_51QmlVlHgK1fpQ7EODxvlpfxHxf4xIGyIA5HVpbtOIcXJuhtraPx7CpRmku4YwWb8JDaOmY55OwdQSa2WVwF2UvOX0067Xpcr20");
const API_BASE_URL = "https://api.donneur.ca";
console.log(API_BASE_URL);

export default function Donation(){
  
  const { id } = useParams();

  const [total, setTotal] = useState('');
  const [clientSecret, setClientSecret] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  const [receiverData, setReceiverData] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/receiver/donation_profile?receiver_id=${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        setReceiverData(result);
      } catch (err) {
        // setError(err.message);
      } finally {
        // setLoading(false);
      }
    };

    if (id) fetchData();
    
  }, [id])


  const createPayment = () => {
    setIsMenuOpen(true);
    handlePaymentSend()
  }


  const handlePaymentSend = async () => {
    let totalToSend = parseFloat(total);
    if (!isNaN(totalToSend) && totalToSend > 0){
      try{
        const response = await fetch(`${API_BASE_URL}/donation/create`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",  // Tell the server we are sending JSON
          },
          body: JSON.stringify({ 
            amount: totalToSend,
            receiver_id: id 
          }),
        });

        if (!response.ok){
          throw new Error("Request Failed");
        }

        const data = await response.json();  // Parse the response to JSON
        console.log("Payment successful: ", data);
        setClientSecret(data.clientSecret);
        } catch (error) {
          console.error("Error sending payment: ", error);
        }
        
    }
  }
  if (!receiverData) return <></>;
  return (
    
    <div className="flex items-center justify-center w-screen h-[100svh] flex-col">
      <div className="flex items-center justify-between w-[80%] h-[90%] flex-col">
        <div className="flex items-center justify-between flex-col w-full h-[85%]">
          < Profile       profileData = {receiverData}        />
          < Total         total = {total}                     />
          < Pad           total = {total} setTotal = {  setTotal  } />
        </div>
        {console.log(receiverData)}
        
        < PaymentButton onClick={() => createPayment()}/>
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
        <PaymentTab total={total} stripe={stripePromise} clientSecret={clientSecret} isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </div>          
    </div>
    
      
  )
}