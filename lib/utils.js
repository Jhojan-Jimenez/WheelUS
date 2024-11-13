import { differenceInMinutes, format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { storage } from '../config/database.js';
import CryptoJS from 'crypto-js';
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

export function hashPassword(password) {
  const salt = CryptoJS.lib.WordArray.create(password.substring(0, 6));
  const key = CryptoJS.PBKDF2(password, salt, { keySize: 256 / 32 });
  const encrypted = CryptoJS.AES.encrypt(password, key, {
    iv: salt,
  }).toString();
  return salt.toString() + encrypted;
}

export function verifyPassword(password) {
  try {
    const hashedPassword = hashPassword(password);
    const salt = CryptoJS.lib.WordArray.create(password.substring(0, 6));
    const key = CryptoJS.PBKDF2(password, salt, { keySize: 256 / 32 });
    const encrypted = hashedPassword.substring(32);
    const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
      iv: salt,
    }).toString(CryptoJS.enc.Utf8);
    return decrypted === password;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}
