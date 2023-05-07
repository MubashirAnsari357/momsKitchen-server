import { Dish } from "../models/Dishes.js";
import { User } from "../models/Users.js";
import { Order } from "../models/Orders.js";
import { Feedback } from "../models/Feedbacks.js";
import fs from "fs";

export const addFeedback = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Please Login First!" });
    }

    const dish = await Dish.findById(req.params.dishId);

    const order = await Order.find({
      $and: [
        { "dishes.dishId": req.params.dishId },
        { customer: req.user._id },
      ],
    });

    if (order.length <= 0) {
      return res
        .status(401)
        .json({ success: false, message: "Please order the dish first!" });
    }

    const { rating, feedbackDesc } = req.body;

    const feedback = await Feedback.create({
      customer: user._id,
      dish: dish._id,
      rating,
      feedbackDesc,
    });

    if (!feedback) {
      return res
        .status(401)
        .json({ success: false, message: "Error Adding Feedback" });
    }

    const updatedDish = await Dish.findByIdAndUpdate(
      dish._id,
      { $push: { feedbacks: feedback._id } },
      { new: true }
    );

    if (updatedDish) {
      return res
        .status(201)
        .json({ success: true, message: "Your feedback has been added!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFeedback = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Please Login First" });
    }

    let feedback = await Feedback.findById(req.params.feedbackId);

    if (!feedback) {
      return res.status(400).json({ success: false, message: "Not found!" });
    }

    const { rating, feedbackDesc } = req.body;

    const newFeedback = {};
    if (rating) newFeedback.rating = rating;
    if (feedbackDesc) newFeedback.feedbackDesc = feedbackDesc;

    feedback = await Feedback.findByIdAndUpdate(
      req.params.feedbackId,
      { $set: newFeedback },
      { new: true }
    );

    if (feedback) {
      return res
        .status(200)
        .json({ success: true, message: "Feedback updated successfully!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Please Login First" });
    }

    const feedback = await Feedback.findByIdAndDelete(req.params.feedbackId);

    if (!feedback) {
      return res
        .status(404)
        .json({ success: false, message: "Feedback not found" });
    }

    const updatedDish = await Dish.findOneAndUpdate(
      { feedbacks: req.params.feedbackId },
      { $pull: { feedbacks: req.params.feedbackId } },
      { new: true }
    );

    if (updatedDish) {
      return res
        .status(200)
        .json({ success: true, message: "Feedback deleted successfully!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate(["customer", "dish"]);
    res.status(200).json({ feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDishFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ dish: req.params.dishId }).populate(
      "customer"
    );
    res.status(200).json({ feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDishUserFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({
      $and: [{ dish: req.params.dishId }, { customer: req.user._id }],
    }).populate("customer");
    res.status(200).json({ feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getChefFeedbacks = async (req, res) => {
  try {
    const allFeedbacks = await Feedback.find({})
      .populate({
        path: "dish",
        match: { chef: req.params.chefId },
      })
      .populate("customer");

    const feedbacks = allFeedbacks.filter(
      (feedback) => feedback.dish !== null
    );
    res.status(200).json({ feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
