const express = require("express");
const productRoute = require("./product.route");
const userRoute = require("./user.route");

const router = express.Router();

router.use("/products", productRoute);
router.use("/users", userRoute);

module.exports = router;
