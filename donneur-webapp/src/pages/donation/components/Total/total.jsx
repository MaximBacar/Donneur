export default function Total({total}){
    const formatTotal = (input) => {
        let total_decimal = parseFloat(input);
        if (isNaN(total_decimal)){
            if (input === '.') return '0.00';
            return '0'
        } else {
            if (input.includes('.')){
                return total_decimal.toFixed(2)
            }
        }
        return total_decimal
    };

    return (
        <div className="flex flex-col items-center justify-center w-full py-3">
            <div className="relative flex items-center justify-center">
                <div className="text-4xl font-semibold text-blue-500 mr-1">$</div>
                <div className="text-6xl font-bold tracking-tight">
                    {formatTotal(total)}
                </div>
            </div>
            <div className="mt-2 text-gray-500 text-sm font-medium">
                Enter donation amount
            </div>
        </div>
    )
}