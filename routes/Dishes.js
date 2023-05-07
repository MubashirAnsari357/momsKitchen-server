import express from "express";
import { addDish, deleteDish, getChefDishes, getDishDetails, getDishes, search, updateDish } from "../controllers/Dishes.js";
import multer from "multer";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './tmp')
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, Date.now() + '-' + file.originalname)
    }
  })
  
const upload = multer({ storage: storage })

router.route("/adddish").post(isAuthenticated, upload.array('photos'), addDish)
router.route("/updatedish/:dishId").put(isAuthenticated, upload.array('photos'), updateDish)
router.route("/deletedish/:dishId").delete(isAuthenticated, deleteDish)
router.route("/getdishes").get(getDishes)
router.route("/getdishdetails/:dishId").get(getDishDetails)
router.route("/getchefdishes/:chefId").get(getChefDishes)
router.route("/search").get(search)

export default router