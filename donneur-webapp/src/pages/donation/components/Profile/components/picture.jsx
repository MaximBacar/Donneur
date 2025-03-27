export default function Picture({imageURL}){
    return(
        <div className="flex w-[50px] h-[50px] rounded-full overflow-hidden shadow border-2 border-white">
            <img 
                className="w-full h-full object-cover" 
                src={imageURL || 'https://via.placeholder.com/50'} 
                alt="Profile" 
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/50?text=P';
                }}
            />
        </div>
    )
}