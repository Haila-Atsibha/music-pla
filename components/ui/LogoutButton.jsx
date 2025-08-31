import { useRouter } from "next/router";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // redirect to homepage
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition mt-[100%] cursor-pointer"
    >
      Logout
    </button>
  );
}
