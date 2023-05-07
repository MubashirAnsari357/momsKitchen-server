import express from "express";
import { addFeedback, deleteFeedback, getAllFeedbacks, getChefFeedbacks, getDishFeedbacks, getDishUserFeedback, updateFeedback } from "../controllers/Feedbacks.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.route("/addfeedback/:dishId").post(isAuthenticated, addFeedback)
router.route("/deletefeedback/:feedbackId").delete(isAuthenticated, deleteFeedback)
router.route("/updatefeedback/:feedbackId").put(isAuthenticated, updateFeedback)
router.route("/getallfeedbacks").get(getAllFeedbacks)
router.route("/getdishfeedbacks/:dishId").get(getDishFeedbacks)
router.route("/getdishuserfeedback/:dishId").get(isAuthenticated, getDishUserFeedback)
router.route("/getcheffeedbacks/:chefId").get(isAuthenticated, getChefFeedbacks)

export default router