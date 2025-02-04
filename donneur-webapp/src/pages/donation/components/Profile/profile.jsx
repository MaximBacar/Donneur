import Picture from "./components/picture"
export default function Profile(){
    return(
        <div className="flex flex-col align-center">
            <Picture></Picture>
            <h1 className="text-center mt-[10px]">Jacob B.</h1>
        </div>
    )
}