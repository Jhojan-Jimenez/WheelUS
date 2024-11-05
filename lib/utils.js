import { format } from 'date-fns';
import { storage } from '../config/database.js';
import {
  formatInTimeZone,
  fromZonedTime,
  getTimezoneOffset,
  toZonedTime,
} from 'date-fns-tz';
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
