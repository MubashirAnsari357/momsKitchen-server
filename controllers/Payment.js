import { instance } from "../index.js";
import crypto from "crypto";
import { Order } from "../models/Orders.js";

export const getkey = async (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY });
};

export const checkout = async (req, res) => {
  try {
    const options = {
      amount: Number(req.body.amount)*100,
      currency: "INR",
    };
    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const paymentVerification = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      const newOrder = {};
      newOrder.paymentInfo = {
        razorpay_order_id: razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
      };
      newOrder.paymentStatus = "Paid";
      await Order.updateMany({"orderId": req.params.orderId}, {$set: newOrder}, {new: true})

      res.status(200).json({ success: true, message: "Payment Successfull" });
    } else {
      res.status(400).json({
        success: false,
        error: "Payment Failed",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
