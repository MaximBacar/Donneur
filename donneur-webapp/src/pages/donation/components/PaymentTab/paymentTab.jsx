import { motion } from "framer-motion";
import { Elements } from "@stripe/react-stripe-js";
import ECheckout from "../Checkout/check2";
import React from "react";

export default function PaymentTab({ total, stripe, clientSecret, isOpen, onClose }) {
  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#4F46E5',
      colorBackground: '#FFFFFF',
      colorText: '#1F2937',
      colorDanger: '#EF4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };
  const loader = 'auto';

  // Format total with commas for thousands
  const formattedTotal = parseFloat(total).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: isOpen ? "0%" : "100%" }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 h-[80%] w-full bg-white shadow-2xl rounded-t-3xl flex flex-col items-center z-20"
    >
      {/* Handle to pull modal - visual indicator */}
      <div className="w-12 h-1.5 bg-gray-300 rounded-full mt-3 mb-1"></div>

      <div className="w-full max-w-md px-5 pt-3 pb-6 h-full flex flex-col">
        {/* Header with close button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm font-medium">You are</span>
            <span className="text-gray-900 text-xl font-bold mt-0.5">Sending a donation</span>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Close donation panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Donation amount with visual emphasis */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center py-8 mb-4">
          <div className="flex items-baseline">
            <span className="text-3xl font-medium text-gray-800 mr-1">$</span>
            <h1 className="text-7xl font-bold text-gray-900 tracking-tight">{formattedTotal}</h1>
          </div>
          <div className="mt-2 flex items-center justify-center text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Secure payment powered by Stripe</span>
          </div>
        </div>

        {/* Payment methods section */}
        <div className="flex-1 w-full">
          <div className="mb-4">
            <h2 className="text-gray-700 font-medium mb-3">Express payment methods</h2>
            <div className="bg-gray-50 p-4 rounded-xl">
              {clientSecret !== "" ? (
                <Elements options={{ clientSecret, appearance, loader }} stripe={stripe}>
                  <ECheckout />
                </Elements>
              ) : (
                <div className="w-full flex items-center justify-center h-20">
                  <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-3">
                      <div className="h-2 bg-gray-200 rounded"></div>
                      <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Impact message */}
          <div className="mt-auto py-4">
            <div className="bg-indigo-50 rounded-xl p-4 flex items-start">
              <div className="mr-3 flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-indigo-900 font-medium">Thank you for your generosity</p>
                <p className="text-xs text-indigo-700 mt-0.5">Your donation makes a meaningful difference.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}