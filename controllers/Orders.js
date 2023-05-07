import { Dish } from "../models/Dishes.js";
import { Order } from "../models/Orders.js";
import { User } from "../models/Users.js";

export const placeOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || user.userType != "User") {
      return res.status(400).json({ success: false, message: "Please Login" });
    }
    const { orderId, basket, deliveryAddress, name, phone, totalAmount } =
      req.body;


    for (let index = 0; index < basket.items.length; index++) {
      const item = basket.items[index];
      const dish = await Dish.findById(item._id);

      if(dish.availableQty<item.quantity){
        return res.status(401).json({ success: false, message: "Out of Stock" });
      }

      let basketDish = {
        dishId: item._id,
        name: item.name,
        chefName: item.chefName,
        chefId: item.chefId,
        photo: item.photo,
        price: item.price,
        quantity: item.quantity,
        itemTotal: item.itemTotal,
      }

      const order = await Order.create({
        orderId: orderId,
        dish: basketDish,
        customer: user._id,
        name: name,
        phone: phone,
        deliveryAddress: deliveryAddress,
        totalAmount: totalAmount,
      });

      const newQty = dish.availableQty - item.quantity;

      await Dish.findByIdAndUpdate(item._id, { availableQty: newQty });

       if (!order) {
        return res.status(500).json({ success: false, message: "Error placing order" });
      }
    }
    return res.status(201).json({ success: true, message: "Your order has been placed!" });


  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || user.userType != "User") {
      return res.status(400).json({ success: false, message: "Please Login" });
    }
    const Orders = await Order.find({ customer: req.params.userId }).populate("customer");
    res.status(200).json({ Orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(400).json({ success: false, message: "Please Login" });
    }
    const order = await Order.findById(req.params.orderId).populate("customer");
    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getChefOrders = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || user.userType != "Chef") {
      return res.status(400).json({ success: false, message: "Please login as Chef" });
    }
    const Orders = await Order.find({ "dish.chefId": req.user._id }).populate("customer");
    res.status(200).json({ Orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || user.userType != "Chef") {
      return res.status(400).json({ success: false, message: "Please Login as Chef" });
    }

    const { orderStatus } = req.body;

    
    const order = await Order.findByIdAndUpdate(req.params.orderId, { $set: { orderStatus: orderStatus } }, { new: true })
    
    if(order){
      return res.status(200).json({ success: true, message: "Order status updated!" });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDeliveryStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || user.userType != "Chef") {
      return res.status(400).json({ success: false, message: "Please Login as Chef" });
    }

    const { deliveryStatus } = req.body;
    
    const order = await Order.findByIdAndUpdate(req.params.orderId, { $set: { deliveryStatus: deliveryStatus } }, { new: true })

    if(order){
      return res.status(200).json({ success: true, message: "Delivery status updated!" });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

