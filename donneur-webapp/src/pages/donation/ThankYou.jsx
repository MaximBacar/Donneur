import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js/pure';
import { Elements, useStripe } from '@stripe/react-stripe-js';
import { Link } from 'react-router-dom';

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

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Retrieve the "payment_intent_client_secret" and "redirect_status" query parameters
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );
    const redirectStatus = new URLSearchParams(window.location.search).get(
      'redirect_status'
    );

    // If no client secret, show a generic thank you message
    if (!clientSecret) {
      setPaymentStatus({
        status: 'generic',
        message: 'Thank you for your support.',
        amount: null
      });
      return;
    }

    // Retrieve payment intent details
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) {
        setPaymentStatus({
          status: 'error',
          message: 'Payment information could not be retrieved.',
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
          
          setPaymentStatus({
            status: 'success',
            message: 'Thank you for your donation!',
            amount: amount
          });
          break;
        case 'processing':
          setPaymentStatus({
            status: 'processing',
            message: 'Your donation is processing.',
            amount: null
          });
          break;
        case 'requires_payment_method':
          setPaymentStatus({
            status: 'error',
            message: 'Your payment was not successful, please try again.',
            amount: null
          });
          break;
        default:
          setPaymentStatus({
            status: 'error',
            message: 'Something went wrong with your donation.',
            amount: null
          });
          break;
      }
    });
  }, [stripe]);

  // Define UI components for different states
  const renderStatus = () => {
    switch (paymentStatus.status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Processing your donation...</p>
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
              <Link to="/" className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                Return to Homepage
              </Link>
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
              <Link to="/" className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                Return to Homepage
              </Link>
              <button 
                onClick={() => window.print()}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center"
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
            <Link to="/" className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
              Return to Homepage
            </Link>
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
              <Link to="/" className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                Return to Homepage
              </Link>
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
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