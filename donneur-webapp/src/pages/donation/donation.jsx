import { useParams }    from "react-router-dom";
import React, { useEffect, useState } from 'react';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import PaymentButton    from "./components/PaymentButton/paymentButton";
import Profile          from "./components/Profile/profile"; 
import Total            from "./components/Total/total";
import Pad              from "./components/DigitPad/pad";
import Checkout         from "./components/Checkout/checkout";


const stripePromise = loadStripe("pk_test_51QmlVlHgK1fpQ7EODxvlpfxHxf4xIGyIA5HVpbtOIcXJuhtraPx7CpRmku4YwWb8JDaOmY55OwdQSa2WVwF2UvOX0067Xpcr20");
const API_BASE_URL = "http://api.donneur.ca";
console.log(API_BASE_URL);

export default function Donation(){
  
  const [clientSecret, setClientSecret] = useState("");

  const appearance = {
    theme: 'stripe',
  };
  // Enable the skeleton loader UI for optimal loading.
  const loader = 'auto';

  const { id } = useParams();

  const [os, setOs] = useState('');
  const [total, setTotal] = useState('');

  useEffect(() => {
    setOs(getOS());
  }, []);

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
      {clientSecret.length == 0 && (<div id="default" className="flex items-center justify-center w-screen h-screen flex-col">
          < Profile                                           />
          < Total         total = {total}                     />
          < Pad           total = {total} setTotal = {  setTotal  } />
          < PaymentButton os    = {os}    onClick = { () => handlePaymentSend()}                     />
      </div>)}
      {clientSecret.length > 0 && (
        <Elements options={{clientSecret, appearance, loader}} stripe={stripePromise}>
          <Checkout/>
        </Elements>
      )}
    </>
      
  )
}

function getOS() {
    const userAgent = navigator.userAgent;

    console.log(userAgent);
    
    if (userAgent.includes("Windows NT")) return "Windows";
    if (userAgent.includes("Mac OS X")) return "macOS";
    if (userAgent.includes("Linux")) return "Linux";
    if (/iPhone|iPad|iPod/.test(userAgent)) return "iOS";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("CrOS")) return "Chrome OS";
  
    return "Unknown OS";
  }
  
  console.log(getOS());
  