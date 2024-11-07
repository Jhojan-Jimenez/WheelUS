import { differenceInMinutes, format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
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
export const obtainLocalTime = () => {
  const currentDate = new Date();
  const timeZone = 'America/Bogota';
  const serverDate = toZonedTime(currentDate, timeZone);
  const bogotaDate = format(serverDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", {
    timeZone: 'America/Bogota',
  });
  return bogotaDate;
};
export const differenceBetweenHours = (time) => {
  return differenceInMinutes(new Date(time), obtainLocalTime());
};
