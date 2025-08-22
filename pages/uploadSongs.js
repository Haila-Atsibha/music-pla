function UploadSong() {
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async () => {
      const base64 = reader.result.split(",")[1]; // remove metadata

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileBase64: base64,
        }),
      });

      const data = await res.json();
      console.log("Uploaded URL:", data.url);
    };

    reader.readAsDataURL(file);
  };

  return <input type="file" accept="audio/*" onChange={handleUpload} />;
}
