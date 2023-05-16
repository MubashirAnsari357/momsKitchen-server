import express from "express";
import { checkout, getkey, paymentVerification } from "../controllers/Payment.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.route("/getkey").get(isAuthenticated, getkey)
router.route("/checkout").post(isAuthenticated, checkout)
router.route("/paymentverification/:orderId").put(isAuthenticated, paymentVerification)


export default router