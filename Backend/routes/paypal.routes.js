require("dotenv").config();;
const express = require("express");

const PaypalClient = require("../utils/paypalClient");
const PayPal = require("@paypal/paypal-server-sdk");

const router = express.Router();

router.get("/config", (req, res) => {
  res.send({
    clientId: process.env.PAYPAL_CLIENT_ID,
  });
});

router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        error: "Invalid amount provided",
      });
    }

    const request = new PayPal.orders.OrdersCreateRequest();
    request.prefer("return = representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        { amount: { currency_code: "USD", value: amount.toString() } },
      ],
    });

    const response = await PaypalClient.execute(request);
    res.status(200).json({
      id: response.result.id,
      status: response.result.status,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create paypal order",
      details: error.message,
    });
  }
});

router.post("/capture-order", async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        error: "No ID order provided",
      });
    }

    const getOrderRequest = new PayPal.orders.OrdersGetRequest(orderId);
    const orderDetails = await PaypalClient.execute(getOrderRequest);
    const request = new PayPal.orders.OrderCaptureRequest(orderId)
    req.requestBody({})

    const response = await PaypalClient.execute(request)

    const captureData = {
      id: response.result.id, status: response.result.status
    }

    if (response.result.payer) {
      captureData.payer = {
        email_address: response.result.payer.email_address,
        payer_id: response.result.payer.payer_id,
        name: response.result.payer.name
          ? {
            given_name: response.result.payer.name.given_name,
            surname: response.result.payer.name.surname
          } : undefined
      }
    }

    if (response.result.purchase_units && response.result.purchase_units.length > 0) {
      captureData.purchase_units = response.result.purchase_units.map((unit) => ({
        reference_id: unit.reference_id,
        amount: unit.payments?.capture?.[0]?.amount,
        shipping: unit.shipping
      }))
    }

    res.status(200).json(captureData)
  } catch (error) {
    res.status(500).json({
      error: "Failed to capture paypal order",
      details: error.message,
      debug_id: error.debug_id || undefined,
      links: error.links || undefined,
    });
  }
});

module.exports = router;
