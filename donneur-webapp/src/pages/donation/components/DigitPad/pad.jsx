import PadButton from "./components/padButton";
export default function Pad({ total, setTotal }) {

    const handleButtonClick = (value) => {
        if (value === "DEL") {
            setTotal(total.slice(0, -1)); 
        } 
        else if (value === "," && !total.includes(".")) {
                setTotal(total + ".");
        } else if (!isNaN(value)) {
            if (total.includes('.')){
                if (total.length - total.indexOf('.') < 3){
                    setTotal(total + value);
                }
            }else{
                if (total.length < 3){
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
        <div className="flex flex-col w-[280px] h-[220px] justify-between text-[24px] my-[50px]">
            {buttons.map((row, rowIndex) => (
                <div key={rowIndex} className="flex flex-row w-full justify-between">
                    {row.map((label) => (
                        <PadButton key={label} onClick={() => handleButtonClick(label)}>
                            {label}
                        </PadButton>
                    ))}
                </div>
            ))}
        </div>
    );
}
