require('dotenv').config();
const express = require("express");
const productRoute = require("./product.route");
const userRoute = require("./user.route");
const orderRoute = require("./order.routes");
const paypalRoutes = require("./paypal.routes");

const router = express.Router();

router.use("/products", productRoute);
router.use("/users", userRoute);
router.use("/orders", orderRoute);
router.use("/paypal", paypalRoutes);

router.get('/config/paypal', (req, res) => {
    const clientId = process.env.PAYPAL_CLIENT_ID;

    if (!clientId) {
        return res.status(500).json({
            error: "Paypal client id is not configured"
        });
    }

    return res.json({ clientId });
});

module.exports = router;
