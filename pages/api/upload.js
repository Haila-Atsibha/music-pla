import supabase from "../../lib/supabaseClient"; // the client you made

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fileName, fileBase64 } = req.body; 
    // file should be sent as base64 string or multipart form

    // Convert base64 to Uint8Array (binary)
    const buffer = Buffer.from(fileBase64, "base64");

    // Upload to bucket "songs"
    const { data, error } = await supabase.storage
      .from("songs")
      .upload(fileName, buffer, {
        contentType: "audio/mpeg", // or audio/wav etc
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from("songs")
      .getPublicUrl(fileName);

    return res.status(200).json({ url: publicUrl.publicUrl });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
