export default function PadButton({children, onClick}){
    return (
        <button onClick={onClick} className="flex h-[50px] w-[50px] items-center justify-center">
            {children}
        </button>
    )
}