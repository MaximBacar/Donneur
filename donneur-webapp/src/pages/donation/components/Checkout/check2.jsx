import React, { useState } from "react";
import { useStripe, useElements, ExpressCheckoutElement } from '@stripe/react-stripe-js';

export default function ECheckout() {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState();
  const [isProcessing, setIsProcessing] = useState(false);

  const onConfirm = async (event) => {
    if (!stripe) {
      // Stripe.js hasn't loaded yet.
      return;
    }

    setIsProcessing(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message);
        setIsProcessing(false);
        return;
      }

      // Confirm the PaymentIntent using the details collected by the Express Checkout Element
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: 'https://donneur.ca/thank-you',
        },
      });

      if (error) {
        // Payment failed
        setErrorMessage(error.message);
        setIsProcessing(false);
      } else {
        // The payment UI automatically closes with a success animation
        // Customer is redirected to return_url
      }
    } catch (e) {
      console.error("Payment error:", e);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  const expressCheckoutOptions = {
    buttonType: {
      applePay: 'donate',
      googlePay: 'donate'
    }
  };

  return (
    <div id="checkout-page" className="w-full">
      <ExpressCheckoutElement 
        onConfirm={onConfirm} 
        options={expressCheckoutOptions}
        className="w-full"
      />
      
      {isProcessing && (
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
    </div>
  );
};