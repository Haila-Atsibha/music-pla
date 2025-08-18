import Image from "next/image"

export default function ImageCard() {
  return (
    <div className="w-80 h-52 rounded-2xl shadow-lg overflow-hidden relative">
      {/* Background Image */}
      <Image 
        src="/img1.jpg" 
        alt="Background" 
        fill 
        className="object-cover"
      />
      
      {/* Overlay (optional for dim effect) */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Empty content area */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* You can put text or buttons here later */}
      </div>
    </div>
  )
}
