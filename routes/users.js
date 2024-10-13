import { Router } from "express";
import userController from "../controllers/user.js";
const userRouter = Router();

userRouter.get("/:id", userController.getUser);
userRouter.patch("/:id", userController.patchUser);

export default userRouter;
