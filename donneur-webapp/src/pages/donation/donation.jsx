import { useParams }    from "react-router-dom";
import React, { useEffect, useState } from 'react';
import { loadStripe } from "@stripe/stripe-js";


import PaymentButton    from "./components/PaymentButton/paymentButton";
import Profile          from "./components/Profile/profile"; 
import Total            from "./components/Total/total";
import Pad              from "./components/DigitPad/pad";
import Checkout         from "./components/Checkout/checkout";


import PaymentTab from "./components/PaymentTab/paymentTab";


const stripePromise = loadStripe("pk_test_51QmlVlHgK1fpQ7EODxvlpfxHxf4xIGyIA5HVpbtOIcXJuhtraPx7CpRmku4YwWb8JDaOmY55OwdQSa2WVwF2UvOX0067Xpcr20");
const API_BASE_URL = "https://api.donneur.ca";
console.log(API_BASE_URL);

export default function Donation(){
  
  

 

  const { id } = useParams();

  const [total, setTotal] = useState('');
  const [clientSecret, setClientSecret] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  const createPayment = () => {
    setIsMenuOpen(true);
    handlePaymentSend()
  }


  const handlePaymentSend = async () => {
    let totalToSend = parseFloat(total);
    if (!isNaN(totalToSend) && totalToSend > 0){
      try{
        const response = await fetch(`${API_BASE_URL}/create_payment`, {
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

  return (
    <>
      <div id="default" className="flex items-center justify-center w-screen h-screen flex-col">
          < Profile                                           />
          < Total         total = {total}                     />
          < Pad           total = {total} setTotal = {  setTotal  } />
          < PaymentButton onClick={() => createPayment()}/>

          {isMenuOpen && (
            <div
              className="fixed inset-0 bg-black opacity-50"
              onClick={() => setIsMenuOpen(false)}
            />
          )}

          <PaymentTab total={total} stripe={stripePromise} clientSecret={clientSecret} isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

          {/* {clientSecret.length > 0 && ( 
            <Elements options={{clientSecret, appearance, loader}} stripe={stripePromise}>
            <ECheckout/>
            </Elements>
            )} */}
          
      </div>
    </>
      
  )
}