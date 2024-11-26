import { differenceInMinutes, format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { storage } from '../config/database.js';
import CryptoJS from 'crypto-js';
export const savePhotoInStorage = async (img) => {
  const formData = new FormData();
  formData.append('image', img);
  formData.append('type', 'file');
  formData.append('title', img.originalname);
  formData.append('description', 'Image uploaded by user');

  try {
    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID  ${process.env.IMGUR_CLIENT_ID}`,
      },
      body: formData,
    });
    console.log(response);

    const data = await response.json();

    if (response.ok) {
      const url = data.data.link; // Aquí está el enlace de la imagen subida.
      console.log('Success:', data);
      return url;
    } else {
      console.error('Error:', data);
      throw new Error(data.errors?.[0]?.detail || 'Error al subir imagen');
    }
  } catch (error) {
    console.error('Error en savePhotoInStorage:', error);
    throw error; // Lanza el error para que sea manejado donde se llame a la función.
  }
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
