import ApplePay from "./components/applePay"
import GooglePay from "./components/googlePay";

export default function PaymentButton({ os, onClick, disabled }) {
    return(
        <button 
            onClick={onClick}
            disabled={disabled} 
            className={`
                w-2/3 h-14 flex items-center mx-auto justify-center
                text-white font-medium text-base rounded-xl
                transition-all duration-150 
                ${disabled 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-600 active:bg-blue-700 shadow-lg shadow-blue-100'
                }
            `}
        >
            <div className="flex items-center">
                <span className="mr-2">Donate Now</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
            </div>
        </button>
    )
}
