import Link from "next/link";
import { FaTimes } from "react-icons/fa";

export default function Drawer({ isOpen, displayDrawer }) {
  return (
    <div
      className={` fixed top-0 left-0 h-full w-64 bg-[hsl(228,27%,35%)] z-50 p-6 flex flex-col gap-4 text-white transform transition-transform duration-500 ease-in-out shadow-xl ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
           <button onClick={displayDrawer}
          className="self-end text-white text-2xl mb-4">
          <FaTimes />
        </button>
  <Link href="/">Home</Link>
  <Link href="/Music">Music</Link>
  <Link href="/artists">Artists</Link>
  <Link href="/">Home</Link>
  <Link href="/Music">Music</Link>
  <Link href="/artists">Artists</Link>
  <Link href="/">Home</Link>
  <Link href="/Music">Music</Link>
  <Link href="/artists">Artists</Link>
    </div>
  );
}
