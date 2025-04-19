import { Router } from "express";
import {registerVendor,getAllVendor} from "../controller/vendor.controller.js"
const vendorRouter= Router();

vendorRouter.route("/registerVendor").post(registerVendor)
vendorRouter.route("/getAllVendor").get(getAllVendor);

export default vendorRouter;