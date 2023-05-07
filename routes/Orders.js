import express from "express";
import { getChefOrders, getOrderDetails, getUserOrders, placeOrder, updateDeliveryStatus, updateOrderStatus } from "../controllers/Orders.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.route("/placeorder").post(isAuthenticated, placeOrder)
router.route("/getmyorders/:userId").get(isAuthenticated, getUserOrders)
router.route("/getcheforders").get(isAuthenticated, getChefOrders)
router.route("/getorderdetails/:orderId").get(isAuthenticated, getOrderDetails)
router.route("/updatedeliverystatus/:orderId").put(isAuthenticated, updateDeliveryStatus)
router.route("/updateorderstatus/:orderId").put(isAuthenticated, updateOrderStatus)


export default router