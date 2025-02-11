import { motion } from "framer-motion";
import { Elements } from "@stripe/react-stripe-js";
import ECheckout from "../Checkout/check2"

export default function PaymentTab({ total, stripe, clientSecret, isOpen, onClose }){

    const appearance = {
        theme: 'stripe',
    };
    const loader = 'auto';

    return(
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: isOpen ? "0%" : "100%" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="fixed bottom-0 left-0 h-[500px] w-full bg-white shadow-xl  rounded-t-2xl flex flex-col items-center justify-center"
            >
            {/* <h2 className="text-xl font-semibold">Payment Menu</h2>
            <p>Securely complete your transaction here.</p>
            <button
                onClick={onClose}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded"
            >
                Close
            </button> */}

            <div className="w-[85%] h-[90%]">
                <div className="w-full h-[60px] flex flex-row items-center justify-between">
                    <div className="flex flex-col items-left justify-center">
                        <h3 className="p-0 m-0 leading-none">You are</h3>
                        <h2 className="p-0 m-0 mt-[5px] leading-none text-xl font-bold">Sending</h2>
                    </div>
                    <div className="h-full w-[60px] flex items-center justify-center">
                        <button onClick={onClose} className="w-10 h-10 bg-black rounded-full"></button>
                    </div>
                </div>

                <div className="w-full h-[50%] mt-[50px] flex items-center justify-center">
                    <h1 className="text-[90px] font-bold">${total}</h1>
                </div>
                
                {console.log(clientSecret == "")}
                {clientSecret != "" && 
                    (<Elements options={{clientSecret, appearance, loader}} stripe={stripe}>
                        <ECheckout/>
                    </Elements>)
                
                }
                
            </div>

        </motion.div>
    );

}