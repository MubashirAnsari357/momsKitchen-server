import { Dish } from "../models/Dishes.js";
import { User } from "../models/Users.js";
import fs from "fs";
import { destroys, uploads } from "../utils/cloudinary.js";

export const addDish = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || user.userType != "Chef") {
      return res
        .status(400)
        .json({ success: false, message: "Please Login as Chef!" });
    }

    const { name, desc, type, cuisine, availableQty, price } = req.body;

    const uploader = async (path) => await uploads(path, "momsKitchen");

    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      fs.unlinkSync(path);
    }

    const dish = await Dish.create({
      chef: user._id,
      name,
      desc,
      type,
      cuisine,
      availableQty,
      price,
      photos: urls,
    });

    if (dish) {
      return res
        .status(201)
        .json({ success: true, message: "Dish Added successfully!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDish = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || user.userType != "Chef") {
      return res
        .status(400)
        .json({ success: false, message: "Please Login as Chef!" });
    }

    let dish = await Dish.findById(req.params.dishId);

    if (!dish) {
      return res.status(400).json({ success: false, message: "Invalid Dish" });
    }

    const { name, desc, type, cuisine, availableQty, price } = req.body;

    const files = req.files;

    console.log(files)

    const newDish = {};
    if (name) newDish.name = name;
    if (desc) newDish.desc = desc;
    if (type) newDish.type = type;
    if (cuisine) newDish.cuisine = cuisine;
    if (availableQty) newDish.availableQty = availableQty;
    if (price) newDish.price = price;
    if (files.length > 0) {
      
      dish.photos.forEach(async (element) => {
        await destroys(element.public_id);
      });

      const uploader = async (path) => await uploads(path, "momsKitchen");

      const urls = [];
      for (const file of files) {
        const { path } = file;
        const newPath = await uploader(path);
        urls.push(newPath);
        fs.unlinkSync(path);
      }
      newDish.photos = urls;

    }

    dish = await Dish.findByIdAndUpdate(
      req.params.dishId,
      { $set: newDish },
      { new: true }
    );

    if (dish) {
      return res
        .status(200)
        .json({ success: true, message: "Dish updated successfully!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDish = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || user.userType != "Chef") {
      return res
        .status(400)
        .json({ success: false, message: "Please Login as Chef!" });
    }

    let dish = await Dish.findById(req.params.dishId);

    if (!dish) {
      return res
        .status(400)
        .json({ success: false, message: "Dish not found" });
    }

    dish.photos.forEach(async (element) => {
      await destroys(element.public_id);
    });

    dish = await Dish.findByIdAndDelete(req.params.dishId);

    if (dish) {
      return res
        .status(200)
        .json({ success: true, message: "Dish deleted successfully!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDishes = async (req, res) => {
  try {
    const Dishes = await Dish.find().populate([
      "chef",
      { path: "feedbacks", populate: { path: "customer" } },
    ]);
    res.status(200).json({ Dishes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDishDetails = async (req, res) => {
  try {
    let dish = await Dish.findById(req.params.dishId).populate([
      "chef",
      { path: "feedbacks", populate: { path: "customer" } },
    ]);
    if (!dish) {
      return res
        .status(400)
        .json({ success: false, message: "Dish not found" });
    }
    res.status(200).json({ dish });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getChefDishes = async (req, res) => {
  try {
    const Dishes = await Dish.find({ chef: req.params.chefId }).populate([
      "chef",
      { path: "feedbacks", populate: { path: "customer" } },
    ]);
    res.status(200).json({ Dishes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const search = async (req, res) => {
  try {
    const search = req.query.search || "";
    const sort = req.query.sort || "";
    let type = req.query.type || "all";

    const typeOptions = [
      "Veg",
      "Dairy",
      "Chicken",
      "Mutton",
      "Beef",
      "SeaFood",
    ];

    type === "all"
      ? (type = [...typeOptions])
      : (type = req.query.type.split(","));

    let Dishes;

    if (sort) {
      Dishes = await Dish.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { desc: { $regex: search, $options: "i" } },
        ],
      })
        .where({ type })
        .sort({ price: sort })
        .populate([
          "chef",
          { path: "feedbacks", populate: { path: "customer" } },
        ]);
    } else {
      Dishes = await Dish.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { desc: { $regex: search, $options: "i" } },
        ],
      })
        .where({ type })
        .populate([
          "chef",
          { path: "feedbacks", populate: { path: "customer" } },
        ]);
    }

    const dishTotal = await Dish.countDocuments({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { desc: { $regex: search, $options: "i" } },
      ],
    }).where({ type });

    const Chefs = await User.find({
      $and: [{ name: { $regex: search, $options: "i" } }, { userType: "Chef" }],
    });

    const chefTotal = await User.countDocuments({
      $and: [{ name: { $regex: search, $options: "i" } }, { userType: "Chef" }],
    });

    res.status(200).json({ Dishes, Chefs, dishTotal, chefTotal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
