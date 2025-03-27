import Picture from "./components/picture"

export default function Profile({profileData}){
    return(
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <div className="relative mr-3">
                    <Picture imageURL={profileData.picture_url}/>
                    <div className="absolute -right-1 -bottom-1 bg-blue-500 rounded-full p-1 shadow">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
                <div>
                    <h1 className="text-lg font-bold">{profileData.name}</h1>
                    <div className="flex items-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Verified
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}