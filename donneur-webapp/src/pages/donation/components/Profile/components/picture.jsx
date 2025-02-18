export default function Picture({imageURL}){
    return(
        <div className="flex w-[120px] h-[120px] rounded-full bg-black overflow-hidden">
            <img className="w-full h-full" src={imageURL}/>
        </div>
    )
}