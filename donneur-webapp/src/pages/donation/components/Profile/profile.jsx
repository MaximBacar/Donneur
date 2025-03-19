import Picture from "./components/picture"
export default function Profile({profileData}){
    return(
        <div className="flex flex-col align-center">
            <Picture imageURL={profileData.image_url}/>
            <h1 className="text-center leading-none mt-[10px]">{profileData.name}</h1>
        </div>
    )
}