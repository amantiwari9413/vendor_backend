import {Router} from "express"
import { addCategory, getCategoryByVendorId,deleteCategory,getAllUniqueCategories } from "../controller/category.controller.js"
const categoryRouter= Router();

categoryRouter.route("/addCategory").post(addCategory)
categoryRouter.route("/getCategoryByVendorId").get(getCategoryByVendorId)
categoryRouter.route("/deletCategory").delete(deleteCategory)
categoryRouter.route("/getAllUniqueCategories").get(getAllUniqueCategories)

export default categoryRouter