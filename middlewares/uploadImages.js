import multer from "multer";

const storage = multer.memoryStorage(); 
const upload = multer({ storage }).single("perfil-photo");

export default upload;
