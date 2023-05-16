import { User } from "../models/Users.js";
import { sendMail } from "../utils/sendMail.js";
import { sendToken } from "../utils/sendToken.js";
import fs from "fs";
import otpGenerator from "otp-generator";
import { destroys, uploads } from "../utils/cloudinary.js";

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      houseNo,
      street,
      city,
      pincode,
      gender,
      chefSpecialization,
      userType,
    } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists!" });
    }

    if (phone) {
      if (phone.length !== 10 || !Number.isInteger(Number(phone))) {
        res.status(400).json({
          success: false,
          message: "Please Enter your 10 digit phone number!",
          cartClear: false,
        });
        return;
      }
    }
    if (pincode) {
      if (pincode.length !== 6 || !Number.isInteger(Number(pincode))) {
        res.status(400).json({
          success: false,
          message: "Please Enter your 6 digit Pincode!",
          cartClear: false,
        });
        return;
      }
    }

    let address = {
      houseNo: houseNo,
      street: street,
      city: city,
      pincode: pincode,
    };

    const path = req.file ? req.file.path : null;
    let newPath;
    if (path) {
      const uploader = async (path) => await uploads(path, "momsKitchen");
      newPath = await uploader(path);
      fs.unlinkSync(path);
    } else {
      newPath = null;
    }

    const otp = otpGenerator.generate(4, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      gender,
      photo: newPath,
      chefSpecialization,
      userType,
      otp,
      otp_expiry: new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000),
    });

    await sendMail(email, "Verify Your Account", `Your OTP is ${otp}`);
    sendToken(
      res,
      user,
      201,
      "OTP has been sent to your email, Please verify your account!"
    );
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verify = async (req, res) => {
  try {
    const otp = Number(req.body.otp);

    const user = await User.findById(req.user._id);

    if (user.otp !== otp || user.otp_expiry < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid OTP!" });
    }

    user.verified = !user.verified;
    user.otp = null;
    user.otp_expiry = null;

    await user.save();

    sendToken(res, user, 200, "Account Verified");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email }).select("+password");

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all the field" });
    }

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email or Password" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Password" });
    }

    sendToken(res, user, 200, "Login Successful!");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
      })
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const myProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    sendToken(res, user, 201, `Welcome ${user.name}`);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter all fields" });
    }

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Old Password" });
    }

    user.password = newPassword;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password Updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized Access!" });

    const {
      name,
      houseNo,
      street,
      city,
      pincode,
      phone,
      gender,
      chefSpecialization,
    } = req.body;

    if (phone.length !== 10 || !Number.isInteger(Number(phone))) {
      res.status(400).json({
        success: false,
        message: "Please Enter your 10 digit phone number!",
        cartClear: false,
      });
      return;
    }
    if (pincode.length !== 6 || !Number.isInteger(Number(pincode))) {
      res.status(400).json({
        success: false,
        message: "Please Enter your 6 digit Pincode!",
        cartClear: false,
      });
      return;
    }

    let address = {
      houseNo: houseNo,
      street: street,
      city: city,
      pincode: pincode,
    };

    const newUser = {};

    const path = req.file ? req.file.path : null;

    newUser.name = name;
    newUser.address = address;
    newUser.phone = phone;
    newUser.gender = gender;
    newUser.chefSpecialization = chefSpecialization;
    if (path) {
      await destroys(user.photo.public_id);
      const uploader = async (path) => await uploads(path, "momsKitchen");
      const newPath = await uploader(path);
      fs.unlinkSync(path);
      newUser.photo = newPath;
    }

    user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: newUser },
      { new: true }
    );

    res
      .status(200)
      .json({ success: true, message: "Profile Updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({
        success: false,
        message: "Can't find an account with this email",
      });

    const otp = otpGenerator.generate(4, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry =
      Date.now() + process.env.OTP_EXPIRE * 60 * 1000;

    await user.save();

    const message = `Your OTP for reseting the password is ${otp}. If you did not request for this, please ignore this email.`;

    await sendMail(email, "Request for resetting password", message);

    res.status(200).json({ success: true, message: `OTP sent to ${email}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPasswordOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({
        success: false,
        message: "Can't find an account with this email",
      });

    if (
      user.resetPasswordOtp !== otp ||
      user.resetPasswordOtpExpiry < Date.now()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP or has been expired!" });
    }

    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpiry = null;

    await user.save();

    res.status(200).json({ success: true, message: `OTP verified` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({
        success: false,
        message: "Can't find an account with this email",
      });

    user.password = password;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: `Password Changed Successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateActive = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized Access!" });

    user.active = !user.active;

    await user.save();

    res.status(200).json({ success: true, message: `Success` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getChefs = async (req, res) => {
  try {
    const chefs = await User.find({ userType: "Chef" });

    res.status(200).json({ chefs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
