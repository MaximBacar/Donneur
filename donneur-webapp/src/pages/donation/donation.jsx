import { useParams }    from "react-router-dom";
import React, { useEffect, useState } from 'react';

import PaymentButton    from "./components/PaymentButton/paymentButton";
import Profile          from "./components/Profile/Profile"; 
import Total            from "./components/Total/total";
import Pad              from "./components/DigitPad/pad";



export default function Donnation(){
    const { id } = useParams();

    const [os, setOs] = useState('');
    const [total, setTotal] = useState(0.00);

    useEffect(() => {
        setOs(getOS());
    }, []);

    return (
        <div className="flex items-center justify-center w-screen h-screen flex-col">
            <Profile/>
            <Total/>
            <Pad/>
            <PaymentButton os = {os}/>
        </div>
    )
}

function getOS() {
    const userAgent = navigator.userAgent;

    console.log(userAgent);
    
    // Windows
    if (userAgent.includes("Windows NT")) {
      return "Windows";
    }
    // macOS
    if (userAgent.includes("Mac OS X")) {
      return "macOS";
    }
    // Linux
    if (userAgent.includes("Linux")) {
      return "Linux";
    }
    // iOS
    if (userAgent.includes("iPhone") || userAgent.includes("iPad") || userAgent.includes("iPod")) {
      return "iOS";
    }
    // Android
    if (userAgent.includes("Android")) {
      return "Android";
    }
    // Chrome OS (can also be considered as Linux-based)
    if (userAgent.includes("CrOS")) {
      return "Chrome OS";
    }
  
    return "Unknown OS";
  }
  
  console.log(getOS());
  