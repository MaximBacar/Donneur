export default function Picture({imageURL}){
    return(
        <div className="flex w-[100px] h-[100px] rounded-full bg-black overflow-hidden">
            <img className="w-full h-full" src={imageURL}/>
        </div>
    )
}