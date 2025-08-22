

export default function UploadButton({ user }) {
  async function handleUpload() {
    const res = await fetch("/api/upload", { method: "POST" });
    const data = await res.json();
    alert(data.message);
  }

  // Only show button if user is admin
if (!user || user.role !== "admin") return null;

  return (
    <button
      onClick={handleUpload}
      className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
    >
      Upload Song
    </button>
  );
}
