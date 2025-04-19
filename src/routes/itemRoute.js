import {Router} from "express"
import { upload } from "../middlewares/multer.middlewares.js";
import { addItem,getAllItemsByVendorId,deleteItem,getItemByName,getItemByCategoryName,getAllItems } from "../controller/item.controller.js";

const itemRouter= Router();

itemRouter.route("/addItem").post(upload.single("itemImg"),addItem);
itemRouter.route("/allItembyVendorId").get(getAllItemsByVendorId);
itemRouter.route("/itembyCategoryName").get(getItemByCategoryName);
itemRouter.route("/itemByName").get(getItemByName);
itemRouter.route("/deletItem").delete(deleteItem);
itemRouter.route("/allItems").get(getAllItems);
export default itemRouter;