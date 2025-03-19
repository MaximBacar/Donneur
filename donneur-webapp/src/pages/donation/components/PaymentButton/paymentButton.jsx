import ApplePay from "./components/applePay"
import GooglePay from "./components/googlePay";


export default function PaymentButton( {os, onClick} ){
    return(
        <button onClick={onClick} className="w-[100%] h-[60px] flex rounded-[30px] bg-black text-white items-center justify-center">
            Confirm
        </button>
    )
}
