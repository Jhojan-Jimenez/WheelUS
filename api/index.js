import express from "express";
import { authCookieJWT } from "../middlewares/authCookieJWT.js";
import authRouter from "../routes/auth.js";
import rideRouter from "../routes/rides.js";
import vehicleRouter from "../routes/vehicles.js";

const app = express();
const port = 3000;


app.use(express.json());

app.use("/auth", authRouter);
app.use("/ride", authCookieJWT, rideRouter);
app.use("/vehicle", authCookieJWT, vehicleRouter);

app.use((req, res) => {
  res.status(404).json({ message: "This route doesn't exist" });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

export default app;
