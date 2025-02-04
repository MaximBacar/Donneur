export default function PadButton({children}){
    return (
        <button className="flex h-[50px] w-[50px] items-center justify-center">
            {children}
        </button>
    )
}