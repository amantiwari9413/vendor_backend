import { Router } from "express";
import {registerVendor,getAllVendor,loginVendor,logoutVendor} from "../controller/vendor.controller.js"
import { verifyVendorJWT } from "../middlewares/auth.middleware.js";
const vendorRouter= Router();

vendorRouter.route("/registerVendor").post(registerVendor)
vendorRouter.route("/getAllVendor").get(getAllVendor);
vendorRouter.route("/loginVendor").post(loginVendor);
vendorRouter.route("/logoutVendor").post(verifyVendorJWT,logoutVendor);
export default vendorRouter;