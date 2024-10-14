import multer from 'multer';

const storage = multer.memoryStorage();
export const upload = multer({ storage }).single('profilePhoto');
export const uploadVehicle = multer({ storage }).fields(([
  { name: 'vehiclePhoto', maxCount: 1 },
  { name: 'soat', maxCount: 1 },
]))
