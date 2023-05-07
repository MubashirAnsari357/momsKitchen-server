import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        minlength: [8, "Password must be 8 characters long"],
        select: false,
        required: true
    },
    address: {
        houseNo: String,
        street: String,
        city: String,
        pincode: Number,
    },
    phone: {
        type: Number,
        maxlength: [10, "Phone number must be 10 digits only"],
    },
    gender: {
        type: String,
        enum: ["Male","Female","Others"],
    },
    photo: {
        public_id: String,
        url: String
    },
    chefSpecialization: {
        type: String,
    },
    userType: {
        type: String,
        enum: ["User","Chef","DeliveryPerson","Admin"],
        default: "User"
    },
    active:{
        type: Boolean,
        default: true,
    },
    verified:{
        type: Boolean,
        default: false,
    },
    otp: Number,
    otp_expiry: Date,
    resetPasswordOtp: Number,
    resetPasswordOtpExpiry: Date,

}, { timestamps: true });


UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


UserSchema.methods.getJWTToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    })
}

UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

UserSchema.index({ otp_expiry: 1 }, { expireAfterSeconds: 0 });

export const User = mongoose.model('user', UserSchema);