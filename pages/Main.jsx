import Link from "next/link";
import { useState } from "react";
import { FaSearch,FaBars} from "react-icons/fa";
import Drawer from "./drawer";
import Music from "./Music"
import SongsList from "./FetchExample.jsx";


export default function Homemain() {
    const [isOpen,setisopen]=useState(false);

  function displayDrawer(){
    setisopen(!isOpen);
    if(isOpen){
        console.log("opened");
    }
    else return;
  }
  return (
    <>
    <header className="bg-[#24293E] text-[#F4F5FC] w-full h-20 flex items-center px-4 sm:px-6 lg:px-8">
      {/* Left Menu */}
      <button className="px-3 py-2 bg-[hsl(216,93%,50%)] text-[#24293E] rounded-lg hover:bg-[#6FAFFF] transition mr-4 flex items-center gap-2" onClick={displayDrawer}>
        <FaBars />Menu
      </button>

      {/* Center area */}
      <div className="flex flex-1 items-center gap-4">
        {/* Music Link */}
        <Link href={"/"} className="whitespace-nowrap hover:text-[#8EBBFF] transition">
          Music
        </Link>

        {/* Search bar */}
        <div className="relative flex-1">
          <input
            type="text"
            className="w-full h-10 sm:h-12 rounded-2xl border-2 border-[#8EBBFF] bg-[#24293E] text-[#F4F5FC] pl-4 pr-10 placeholder-[#CCCCCC] focus:outline-none focus:ring-2 focus:ring-[#8EBBFF] focus:ring-offset-1 transition-all duration-300"
            placeholder="Search..."
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8EBBFF] hover:text-[#F4F5FC] transition-colors duration-300">
            <FaSearch />
          </button>
        </div>

        {/* Artists Link */}
        <Link href={"/"} className="whitespace-nowrap hover:text-[#8EBBFF] transition">
          Artists
        </Link>
      </div>
    </header>
{/* main page */}
    <div className="bg-[#24293E] bg-cover w-full min-h-[calc(100vh-5rem)]">
      <SongsList/>


    </div>
 <Drawer isOpen={isOpen} displayDrawer={displayDrawer} /> 

   </>
   
  );
}