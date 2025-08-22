import UploadButton from "./components/UploadButton";

export default function Home() {
  // pretend user (later, replace with real login)
  const user = { name: "Haila", role: "admin" }; // try "user" instead of "admin"

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">Welcome {user.name}</h1>
      <p className="text-gray-400">Role: {user.role}</p>

      {/* Upload button only for admin */}
      <UploadButton user={user} />
    </div>
  );
}
