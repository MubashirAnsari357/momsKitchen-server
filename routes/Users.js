import express from "express";
import { forgetPassword, getChefs, login, logout, myProfile, register, resetPassword, resetPasswordOtp, updateActive, updatePassword, updateProfile, verify } from "../controllers/Users.js";
import { isAuthenticated } from "../middleware/auth.js";
import multer from "multer";

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

router.route("/register").post(upload.single('photo'), register)
router.route("/verify").post(isAuthenticated, verify)
router.route("/login").post(login)
router.route("/logout").get(logout)
router.route("/me").get(isAuthenticated, myProfile)
router.route("/updatepassword").put(isAuthenticated, updatePassword)
router.route("/forgetpassword").post(forgetPassword)
router.route("/resetotp").put(resetPasswordOtp)
router.route("/resetpassword").put(resetPassword)
router.route("/updateprofile").put(isAuthenticated, upload.single('photo'), updateProfile)
router.route("/updateactive").put(isAuthenticated, updateActive)
router.route("/getchefs").get(getChefs)

export default router