import { storage } from '../config/database.js';
export const savePhotoInStorage = async (img) => {
  const fileName = `${Date.now()}_${img.originalname}`;
  const blob = storage.file(fileName);

  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: img.mimetype,
    },
  });

  blobStream.end(img.buffer);

  const [url] = await blob.getSignedUrl({
    action: 'read',
    expires: '03-09-2491',
  });

  return url;
};
