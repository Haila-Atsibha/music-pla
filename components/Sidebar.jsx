import Link from "next/link";
import { FaMusic, FaHeart, FaList, FaHistory } from "react-icons/fa";

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-[#23263A] text-[#F4F5FC] flex flex-col py-8 px-4 shadow-xl z-40">
      <nav className="flex flex-col gap-6">
        <Link href="/Main" className="flex items-center gap-3 text-lg hover:text-[#8EBBFF] transition">
          <FaMusic /> Music
        </Link>
        <Link href="/favorites" className="flex items-center gap-3 text-lg hover:text-[#8EBBFF] transition">
          <FaHeart /> Favorites
        </Link>
        <Link href="/playlist" className="flex items-center gap-3 text-lg hover:text-[#8EBBFF] transition">
          <FaList /> Playlist
        </Link>
        <Link href="/history" className="flex items-center gap-3 text-lg hover:text-[#8EBBFF] transition">
          <FaHistory /> History
        </Link>
      </nav>
    </aside>
  );
}
