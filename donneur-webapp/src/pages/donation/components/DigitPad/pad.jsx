import PadButton from "./components/padButton";
import { useState } from "react";

export default function Pad({ total, setTotal }) {
    const [animateButton, setAnimateButton] = useState(null);

    const handleButtonClick = (value) => {
        setAnimateButton(value);
        setTimeout(() => setAnimateButton(null), 150);

        if (value === "DEL") {
            setTotal(total.slice(0, -1)); 
        } 
        else if (value === "," && !total.includes(".")) {
            setTotal(total + ".");
        } else if (!isNaN(value)) {
            if (total.includes('.')) {
                if (total.length - total.indexOf('.') < 3) {
                    setTotal(total + value);
                }
            } else {
                if (total.length < 3) {
                    setTotal(total + value);
                }
            }
        }
    };

    const buttons = [
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"],
        [",", "0", "DEL"]
    ];

    return (
        <div className="w-full max-w-xs mx-auto py-4">
            <div className="bg-gradient-to-b from-gray-50 to-white p-4 rounded-3xl shadow-lg border border-gray-100">
                <div className="grid grid-cols-3 gap-3 w-full">
                    {buttons.map((row, rowIndex) => (
                        row.map((label) => (
                            <PadButton 
                                key={`${rowIndex}-${label}`} 
                                onClick={() => handleButtonClick(label)}
                                isAnimating={animateButton === label}
                                isDelete={label === "DEL"}
                                isDecimal={label === ","}
                            >
                                {label}
                            </PadButton>
                        ))
                    ))}
                </div>
            </div>
        </div>
    );
}