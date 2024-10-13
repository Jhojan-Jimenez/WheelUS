import express from "express";
import { authCookieJWT } from "../middlewares/authCookieJWT.js";
import authRouter from "../routes/auth.js";
import rideRouter from "../routes/rides.js";
import vehicleRouter from "../routes/vehicles.js";
import userRouter from "../routes/users.js";
import cors from "cors";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/user", authCookieJWT, userRouter);
app.use("/ride", authCookieJWT, rideRouter);
app.use("/vehicle", authCookieJWT, vehicleRouter);

app.use((req, res) => {
  res.status(404).json({ message: "This route doesn't exist" });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

export default app;
