export default function PadButton({children, onClick, isAnimating, isDelete, isDecimal}){
    return (
        <button 
            onClick={onClick} 
            className={`
                flex items-center justify-center 
                h-14 w-full
                rounded-2xl text-lg font-medium
                transition-all duration-200
                ${isAnimating ? 'scale-95 opacity-70' : ''} 
                ${isDelete ? 'bg-gradient-to-br from-red-50 to-red-100 text-red-500' : 
                  isDecimal ? 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600' : 
                  'bg-gradient-to-br from-white to-gray-50 text-gray-800'}
                hover:shadow-md active:bg-gray-100
                border border-gray-100
            `}
        >
            {isDelete ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.707 4.879A3 3 0 018.828 4H15a3 3 0 013 3v6a3 3 0 01-3 3H8.828a3 3 0 01-2.12-.879l-4.415-4.414a1 1 0 010-1.414l4.414-4.414zm4 2.414a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L13.414 10l1.293-1.293a1 1 0 00-1.414-1.414L12 8.586l-1.293-1.293z" clipRule="evenodd" />
                </svg>
            ) : children}
        </button>
    )
}