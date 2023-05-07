import mongoose from "mongoose";

const DishSchema = new mongoose.Schema(
  {
    chef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    name: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
    },
    type: {
      type: String,
      enum: ["Veg", "Dairy", "Chicken", "Mutton", "Beef", "SeaFood"],
      required: true,
    },
    cuisine: {
      type: String,
    },
    availableQty: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    photos: [
      {
        public_id: String,
        url: String,
      },
    ],
    feedbacks: [{ type: mongoose.Schema.Types.ObjectId, ref: "feedback" }],
  },
  { timestamps: true }
);

export const Dish = mongoose.model("dish", DishSchema);
