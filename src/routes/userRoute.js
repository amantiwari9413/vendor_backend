import { Router } from "express";
import { registerUser, loginUser, logoutUser } from "../controller/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const userRouter=Router();

userRouter.route("/registerUser").post(registerUser);
userRouter.route("/loginUser").post(loginUser);
userRouter.route("/logoutUser").post(verifyJWT,logoutUser);


export default userRouter
