export default function Total({total}){

    const formatTotal = (input) => {
        
        let total_decimal = parseFloat(input);
        if (isNaN(total_decimal)){
            if (input == '.') return '0.00';
            return '0'
        }else{
            if (input.includes('.')){
                return total_decimal.toFixed(2)
            }
        }
        return total_decimal
    };

    return (
        <div className="flex flex-col items-center justify-between w-[100%]">
            <h1 style={{ fontSize: "60px", fontWeight: 400 }} className="text-[120px] font-[400] m-0 p-0 leading-none text-center">${formatTotal(total)}</h1>
            {/* <h2 className="text-center leading-none">will be sent</h2> */}
        </div>
    )
}