import { useParams } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import { loadStripe } from "@stripe/stripe-js/pure";

import PaymentButton from "./components/PaymentButton/paymentButton";
import Profile from "./components/Profile/profile"; 
import Total from "./components/Total/total";
import Pad from "./components/DigitPad/pad";
import Checkout from "./components/Checkout/checkout";
import PaymentTab from "./components/PaymentTab/paymentTab";

loadStripe.setLoadParameters({advancedFraudSignals: false});
const stripePromise = loadStripe("pk_test_51QmlVlHgK1fpQ7EODxvlpfxHxf4xIGyIA5HVpbtOIcXJuhtraPx7CpRmku4YwWb8JDaOmY55OwdQSa2WVwF2UvOX0067Xpcr20");
const API_BASE_URL = "https://api.donneur.ca";

export default function Donation() {
  const { id } = useParams();
  const [total, setTotal] = useState('');
  const [clientSecret, setClientSecret] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [receiverData, setReceiverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/receiver/donation_profile?receiver_id=${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        setReceiverData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const createPayment = () => {
    if (!total || parseFloat(total) <= 0) return;
    setIsMenuOpen(true);
    handlePaymentSend();
  }

  const handlePaymentSend = async () => {
    let totalToSend = parseFloat(total);
    if (!isNaN(totalToSend) && totalToSend > 0) {
      try {
        const response = await fetch(`${API_BASE_URL}/donation/create`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            amount: totalToSend,
            receiver_id: id 
          }),
        });

        if (!response.ok) {
          throw new Error("Request Failed");
        }

        const data = await response.json();
        setClientSecret(data.client_secret);
      } catch (error) {
        console.error("Error sending payment: ", error);
      }
    }
  }
  
  if (loading) return (
    <div className="flex items-center justify-center w-screen h-screen bg-white">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading donation page...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center w-screen h-screen bg-white p-6">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-center mb-2">Unable to Load Profile</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-3 bg-blue-500 text-white font-medium rounded-lg transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  if (!receiverData) return <></>;
  
  const isValidAmount = total && parseFloat(total) > 0;

  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      {/* Header with profile */}
      <div className="bg-gradient-to-b from-blue-50 to-white pt-6 pb-8 px-4">
        <Profile profileData={receiverData} />
      </div>
      
      {/* Main content */}
      <div className="flex-1 px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
          <Total total={total} />
          <Pad total={total} setTotal={setTotal} />
        </div>
      </div>
      
      {/* Fixed bottom section */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 shadow-md">
        <PaymentButton 
          onClick={createPayment} 
          disabled={!isValidAmount}
        />
        
        <div className="flex items-center justify-center mt-3 space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-gray-500">Secured by Stripe</span>
        </div>
      </div>
        
      {/* Modal overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-10 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      
      {/* Payment tab */}
      <PaymentTab 
        total={total} 
        stripe={stripePromise} 
        clientSecret={clientSecret} 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
      />
    </div>
  );
}