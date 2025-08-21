import {FaPlus, FaCheck } from "react-icons/fa";
import { useState } from "react";
export default function Playlist(){

      const [added, setAdded] = useState(false);
      const [DisplayInput,setDisplayInput]=useState(false);
      function handleClick(){
        setDisplayInput(true)
      }

      function handleSubmit(e){
            e.preventDefault();
            setAdded(true);
            setDisplayInput(false);
      }

    return(
        <>
           <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition duration-300 ${
        added ? "bg-green-600 text-white" : "bg-gray-800 text-gray-200"
      }`}
    >
      {added ? <FaCheck /> : <FaPlus />}
      {added ? "Added" : "Add to Playlist"}
    </button>
        {DisplayInput && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
         <form
            onSubmit={handleSubmit}
            className="bg-[#2A2F4F] p-4 rounded-xl flex flex-col gap-2"
          >
            <h2 className="text-lg font-bold">
              Add a Playlist Name
            </h2>
            <input
              type="text"
              placeholder="Write Play List Name..."
              className="border p-2 rounded"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setDisplayInput(false)}
                className="px-4 py-2 bg-gray-400 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Save
              </button>
            </div>
          </form>
        </div> 
    )}

    </>
    );
   
}
