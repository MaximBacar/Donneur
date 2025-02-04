import PadButton from "./components/padButton"

export default function Pad(){
    return(
        <div className="flex flex-col w-[310px] h-[260px] justify-between text-[24px] mt-[50px] mb-[50px]">
            <div className="flex flex-row w-full justify-between">
                <PadButton>1</PadButton>
                <PadButton>2</PadButton>
                <PadButton>3</PadButton>
            </div>
            <div className="flex flex-row w-full justify-between">
                <PadButton>4</PadButton>
                <PadButton>5</PadButton>
                <PadButton>6</PadButton>
            </div>
            <div className="flex flex-row w-full justify-between">
                <PadButton>7</PadButton>
                <PadButton>8</PadButton>
                <PadButton>9</PadButton>
            </div>
            <div className="flex flex-row w-full justify-between">
                <PadButton>,</PadButton>
                <PadButton>0</PadButton>
                <PadButton>DEL</PadButton>
            </div>
        </div>
    )
}