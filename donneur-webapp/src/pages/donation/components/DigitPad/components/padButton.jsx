export default function PadButton({children, onClick}){
    return (
        <button onClick={onClick} className="flex h-[50px] w-[50px] text-[24px] items-center justify-center transition-colors duration-80 active:text-gray-300">
            {children}
        </button>
    )
}