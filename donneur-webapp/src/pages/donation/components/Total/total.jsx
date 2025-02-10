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
        <div className="flex flex-col align-center justify-center w-[300px]">
            <h1 className="text-[64px] text-center">${formatTotal(total)}</h1>
            <h2 className="text-center">will be sent</h2>
        </div>
    )
}