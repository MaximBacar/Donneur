import React, { useState, useEffect } from "react";
import { useStripe, useElements, ExpressCheckoutElement } from '@stripe/react-stripe-js';
import './success-animation.css';

export default function ECheckout() {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState();
  const [paymentStatus, setPaymentStatus] = useState("idle"); // idle, processing, success, error
  const [paymentAmount, setPaymentAmount] = useState(null);

  // Determine the correct return URL based on the current hostname
  const getReturnUrl = (amount = null) => {
    const hostname = window.location.hostname;
    const isGiveDomain = hostname === "give.donneur.ca";
    const isDevelopment = hostname === "localhost" || hostname === "127.0.0.1";
    
    let baseUrl = "";
    if (isGiveDomain) {
      baseUrl = `https://${hostname}/thank-you`;
    } else if (isDevelopment) {
      baseUrl = `${window.location.origin}/thank-you`;
    } else {
      baseUrl = `https://donneur.ca/thank-you`;
    }
    
    // Add amount parameter if available
    if (amount) {
      baseUrl += `?amount=${amount}`;
    }
    
    return baseUrl;
  };

  // Redirect to thank you page after success animation completes
  useEffect(() => {
    if (paymentStatus === "success") {
      const timer = setTimeout(() => {
        window.location.href = getReturnUrl(paymentAmount);
      }, 2500); // Delay redirect for 2.5 seconds to show the animation

      return () => clearTimeout(timer);
    }
  }, [paymentStatus, paymentAmount]);

  const onConfirm = async (event) => {
    if (!stripe) {
      // Stripe.js hasn't loaded yet.
      return;
    }

    setPaymentStatus("processing");

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message);
        setPaymentStatus("error");
        return;
      }

      // Get payment intent to display amount in success screen
      const clientSecret = event.paymentIntent?.client_secret;
      if (clientSecret) {
        const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
        if (paymentIntent?.amount) {
          setPaymentAmount((paymentIntent.amount / 100).toFixed(2));
        }
      }

      // Prepare return URL with amount if available
      const returnUrl = clientSecret 
        ? getReturnUrl(paymentAmount) 
        : getReturnUrl();
        
      // Confirm the PaymentIntent using the details collected by the Express Checkout Element
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'always',  // Change to always redirect
        confirmParams: {
          // Set proper return URL for payment confirmation
          return_url: returnUrl,
        },
      });

      if (error) {
        // Payment failed
        setErrorMessage(error.message);
        setPaymentStatus("error");
      } else if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
        // Payment succeeded
        setPaymentStatus("success");
      } else {
        // Something unexpected happened
        setPaymentStatus("error");
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } catch (e) {
      console.error("Payment error:", e);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setPaymentStatus("error");
    }
  };

  const expressCheckoutOptions = {
    buttonType: {
      applePay: 'donate',
      googlePay: 'donate'
    }
  };

  // Success animation section
  const SuccessAnimation = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-95">
      <div className="flex flex-col items-center justify-center max-w-md mx-auto text-center p-6">
        <div className="success-checkmark">
          <div className="check-icon">
            <span className="icon-line line-tip"></span>
            <span className="icon-line line-long"></span>
            <div className="icon-circle"></div>
            <div className="icon-fix"></div>
          </div>
        </div>
        
        <h2 className="mt-4 text-2xl font-bold text-gray-800">
          {paymentAmount ? `$${paymentAmount} Donated` : 'Donation Complete'}
        </h2>
        <p className="mt-2 text-gray-600">
          Thank you for your generosity!
        </p>
        <div className="mt-4">
          <div className="inline-block h-2 w-2 bg-indigo-600 rounded-full animate-bounce"></div>
          <div className="inline-block h-2 w-2 bg-indigo-600 rounded-full animate-bounce mx-1" style={{ animationDelay: '0.2s' }}></div>
          <div className="inline-block h-2 w-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div id="checkout-page" className="w-full">

      <ExpressCheckoutElement 
        onConfirm={onConfirm} 
        options={expressCheckoutOptions}
        className="w-full"
      />
      
      {paymentStatus === "processing" && (
        <div className="mt-3 flex justify-center items-center text-sm text-gray-600">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing your donation...
        </div>
      )}
      
      {errorMessage && (
        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success animation overlay */}
      {paymentStatus === "success" && <SuccessAnimation />}
    </div>
  );
};