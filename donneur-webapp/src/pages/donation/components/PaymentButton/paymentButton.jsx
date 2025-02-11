import ApplePay from "./components/applePay"
import GooglePay from "./components/googlePay";


export default function PaymentButton( {os, onClick} ){
    return(
        <button onClick={onClick} className="w-[270px] h-[60px] flex rounded-[20px] bg-red-900 overflow-hidden">
            
            {os === "macOS" || os === "iOS" ? (
                    <ApplePay />  
                ) : os === "Android" ? (
                    <GooglePay />  
                ) : (
                    <span>Unsupported OS</span>  // Optional fallback for unsupported OS
                )
            }
        </button>
    )
}
