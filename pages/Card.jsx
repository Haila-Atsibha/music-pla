import Image from "next/image"

export default function ImageCard() {
  return (
    <div className="w-300 h-200 rounded-2xl shadow-lg overflow-hidden relative flex">
      {/* First Image */}
      <div className="relative w-1/2 h-full m-3">
        <Image 
          src="/mike.jpg" 
          alt="Album 1" 
          fill 
          className="object-cover"
        />
      </div>
      {/* Second Image */}
      <div className="relative w-1/2 h-full">
        <Image 
          src="/albumC2.jpg" 
          alt="Album 2" 
          fill 
          className="object-cover"
        />
      </div>
      {/* Overlay (optional for dim effect) */}
      <div className="absolute inset-0 bg-black/30"></div>
      {/* Content area */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Add text or buttons here */}
      </div>
    </div>
  )
}