const fs = require('fs');
const path = require('path');
const supabase = require('../lib/supabase'); // from pages/ to lib/

async function uploadSong() {
  const filePath = path.join(__dirname, 'public', 'song1.mp3'); // replace with your song path
  const fileName = 'song1.mp3'; // name in the bucket
  const bucketName = 'songs'; // make sure you have a "songs" bucket in Supabase Storage

  const fileData = fs.readFileSync(filePath);

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, fileData, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Upload error:', error);
    return;
  }

  // Get public URL
  const { publicUrl, error: urlError } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  if (urlError) {
    console.error('Public URL error:', urlError);
    return;
  }

  console.log('Uploaded successfully! Public URL:', publicUrl);
}

uploadSong();
