import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    dish: {
      dishId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "dish",
      },
      name: {
        type: String,
        required: true,
      },
      chefName: {
        type: String,
        required: true,
      },
      chefId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
      photo: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      itemTotal: {
        type: Number,
        required: true,
      },
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    orderStatus: {
      type: String,
      enum: ["Created", "Accepted", "Rejected", "Cancelled"],
      default: "Created",
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      maxlength: [10, "Phone number must be 10 digits only"],
    },
    deliveryStatus: {
      type: String,
      enum: ["Pending", "Preparing", "Shipped", "Delivered"],
      default: "Pending",
    },
    paymentInfo: {
      type: Object,
    },
    paymentStatus: {
      type: String,
      enum: ["Initiated", "Pending", "Paid", "Failed"],
      default: "Initiated",
    },
    deliveryAddress: {
      houseNo: String,
      street: String,
      city: String,
      pincode: Number,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("order", OrderSchema);
