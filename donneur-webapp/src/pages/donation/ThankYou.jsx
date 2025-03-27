import React from 'react';

const ThankYou = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 mx-auto rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Thank You!</h1>
          <p className="text-xl text-gray-600 mb-1">Your donation has been received.</p>
          <p className="text-md text-gray-500 mb-8">Your generosity makes a meaningful difference.</p>
          <div className="flex flex-col items-center space-y-4">
            <a 
              href="https://donneur.ca"
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            >
              Return to Donneur.ca
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;