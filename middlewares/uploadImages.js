import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage }).single("perfil_photo");

export default upload;
