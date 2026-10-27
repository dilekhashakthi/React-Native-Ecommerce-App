const asyncHandler = require("../utils/asyncHandler");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { calcPrices } = require("../utils/calcPrices");

// Private user

const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  const itemsFromDB = await Product.find({
    _id: { $in: orderItems.map((item) => item._id) },
  });

  const dbOrderItems = orderItems.map((item) => {
    const dbItem = itemsFromDB.find(
      (product) => product._id.toString() === item._id,
    );
    if (!dbItem) {
      res.status(400);
      throw new Error(`Product with ID ${item._id} not found`);
    }

    return {
      ...item,
      product: item._id,
      price: dbItem.price,
      _id: undefined,
    };
  });

  const prices = calcPrices(dbOrderItems);

  const order = new Order({
    orderItems: dbOrderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    ...prices,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.status(200).json(orders);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email",
  );
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.status(200).json(order);
});

const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  order.isPaid = true;
  order.paidAt = Date.now();

  order.paymentResult = {
    id: req.body.paymentId || req.body.id,
    status: req.body.status || "COMPLETED",
    update_time: req.body.update_time || new Date().toISOString(),
    email_address:
      req.body.email_address ||
      req.body.payer?.email_address ||
      "not.provided@example.com",
  };

  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (!product) throw new Error(`Product with ID ${item.product} not found`);

    if (product.countInStock < item.qty) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    product.countInStock -= item.qty;
    await product.save();
  }

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json(updatedOrder);
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "id name");
  res.json(orders);
});

module.exports = {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
};
