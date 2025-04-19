import {Router} from "express"
import { createOrder, getOrdersByUser, getOrdersByVendor, cancelOrder, updateOrderStatus, getOrdersForDelivery } from "../controller/order.controller.js";

const oderRouter= Router();

oderRouter.route("/createOrder").post(createOrder);
oderRouter.route("/getOrdersByUser").get(getOrdersByUser);
oderRouter.route("/getOrdersByVendor").get(getOrdersByVendor);
oderRouter.route("/cancelOrder").put(cancelOrder);
oderRouter.route("/updateOrderStatus").put(updateOrderStatus);
oderRouter.route("/getOrdersForDelivery").get(getOrdersForDelivery);

export default oderRouter