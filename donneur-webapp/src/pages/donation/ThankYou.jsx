import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js/pure';
import { Elements, useStripe } from '@stripe/react-stripe-js';

// Initialize Stripe
loadStripe.setLoadParameters({advancedFraudSignals: false});
const stripePromise = loadStripe("pk_test_51QmlVlHgK1fpQ7EODxvlpfxHxf4xIGyIA5HVpbtOIcXJuhtraPx7CpRmku4YwWb8JDaOmY55OwdQSa2WVwF2UvOX0067Xpcr20");

// Inner component that uses the stripe hook
const ThankYouContent = () => {
  const stripe = useStripe();
  const [paymentStatus, setPaymentStatus] = useState({
    status: 'loading',
    message: '',
    amount: null
  });

  // Add console logging to track payment intent retrieval
  useEffect(() => {
    console.log("ThankYou page loaded");
    if (!stripe) {
      console.log("Stripe not loaded yet");
      return;
    }

    // Retrieve the "payment_intent_client_secret" and "redirect_status" query parameters
    // Check both normal and Stripe Express format (payment_intent vs. payment_intent_client_secret)
    let clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );
    
    // Stripe Express might use a different parameter format
    if (!clientSecret) {
      const paymentIntent = new URLSearchParams(window.location.search).get(
        'payment_intent'
      );
      if (paymentIntent) {
        clientSecret = `${paymentIntent}_secret_`;
      }
    }
    
    const redirectStatus = new URLSearchParams(window.location.search).get(
      'redirect_status'
    );

    console.log("Client secret:", clientSecret ? "Found" : "Not found");
    console.log("Redirect status:", redirectStatus);
    
    // Log all URL parameters for debugging
    console.log("All URL parameters:");
    for (const [key, value] of new URLSearchParams(window.location.search).entries()) {
      console.log(`${key}: ${value}`);
    }

    // If redirectStatus is 'succeeded' but no client secret, still show success
    if (redirectStatus === 'succeeded' && !clientSecret) {
      console.log("No client secret, but redirect status is succeeded");
      
      // Try to parse amount from URL if available
      const amount = new URLSearchParams(window.location.search).get('amount');
      const formattedAmount = amount ? 
        parseFloat(amount).toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD'
        }) : null;
      
      setPaymentStatus({
        status: 'success',
        message: 'Thank you for your donation!',
        amount: formattedAmount || "your donation"
      });
      return;
    }
    
    // If no client secret and no success redirect status, show generic message
    if (!clientSecret) {
      console.log("No client secret, showing generic message");
      setPaymentStatus({
        status: 'generic',
        message: 'Thank you for your support.',
        amount: null
      });
      return;
    }

    // Retrieve payment intent details
    console.log("Retrieving payment intent");
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      console.log("Payment intent retrieved:", paymentIntent?.status);
      
      if (!paymentIntent) {
        console.log("No payment intent found");
        setPaymentStatus({
          status: 'generic',
          message: 'Thank you for your support.',
          amount: null
        });
        return;
      }

      switch (paymentIntent.status) {
        case 'succeeded':
          // Format the amount as currency (amount is in cents)
          const amount = (paymentIntent.amount / 100).toLocaleString('en-US', {
            style: 'currency',
            currency: paymentIntent.currency.toUpperCase()
          });
          
          console.log("Payment succeeded, amount:", amount);
          setPaymentStatus({
            status: 'success',
            message: 'Thank you for your donation!',
            amount: amount
          });
          break;
        case 'processing':
          console.log("Payment is processing");
          setPaymentStatus({
            status: 'processing',
            message: 'Your donation is processing.',
            amount: null
          });
          break;
        case 'requires_payment_method':
          console.log("Payment requires payment method");
          setPaymentStatus({
            status: 'error',
            message: 'Your payment was not successful, please try again.',
            amount: null
          });
          break;
        default:
          console.log("Unknown payment status:", paymentIntent.status);
          setPaymentStatus({
            status: 'generic',
            message: 'Thank you for your support.',
            amount: null
          });
          break;
      }
    }).catch(error => {
      console.error("Error retrieving payment intent:", error);
      setPaymentStatus({
        status: 'generic',
        message: 'Thank you for your support.',
        amount: null
      });
    });
  }, [stripe]);

  // Define UI components for different states
  const renderStatus = () => {
    switch (paymentStatus.status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading donation information...</p>
          </div>
        );
      
      case 'generic':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 mx-auto rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Thank You!</h1>
            <p className="text-xl text-gray-600 mb-1">We appreciate your support.</p>
            <p className="text-md text-gray-500 mb-8">Your generosity makes a meaningful difference.</p>
            <div className="flex flex-col items-center space-y-4">
              <a 
                href="https://donneur.ca"
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
              >
                Visit Donneur.ca
              </a>
            </div>
          </div>
        );
      
      case 'success':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 mx-auto rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Thank You!</h1>
            <p className="text-xl text-gray-600 mb-1">Your donation of {paymentStatus.amount} has been received.</p>
            <p className="text-md text-gray-500 mb-8">Your generosity makes a meaningful difference.</p>
            <div className="flex flex-col items-center space-y-4">
              <a 
                href="https://donneur.ca"
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
              >
                Visit Donneur.ca
              </a>
              <button 
                onClick={() => window.print()}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                </svg>
                Print Receipt
              </button>
            </div>
          </div>
        );
      
      case 'processing':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 mx-auto rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Processing Payment</h1>
            <p className="text-xl text-gray-600 mb-8">Your donation is being processed. This may take a moment.</p>
            <div className="flex flex-col items-center space-y-4">
              <a 
                href="https://donneur.ca"
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
              >
                Visit Donneur.ca
              </a>
            </div>
          </div>
        );
      
      case 'error':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 mx-auto rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Issue</h1>
            <p className="text-xl text-gray-600 mb-2">{paymentStatus.message}</p>
            <p className="text-md text-gray-500 mb-8">Please try again or contact support if the issue persists.</p>
            <div className="flex flex-col space-y-4 items-center">
              <a 
                href="https://donneur.ca"
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
              >
                Visit Donneur.ca
              </a>
              <a 
                href="mailto:support@donneur.ca"
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {renderStatus()}
      </div>
    </div>
  );
};

// Wrapper component that provides Stripe context
const ThankYou = () => {
  return (
    <Elements stripe={stripePromise}>
      <ThankYouContent />
    </Elements>
  );
};

export default ThankYou;