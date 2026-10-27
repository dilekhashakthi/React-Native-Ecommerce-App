require("dotenv").config();
const express = require("express");
const {
  ordersController,
  CheckoutPaymentIntent,
} = require("../utils/paypalClient");

const router = express.Router();

// GET /api/v1/paypal/config - Get PayPal client ID
router.get("/config", (req, res) => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({
      error: "PayPal client ID is not configured in .env",
    });
  }
  return res.status(200).json({
    clientId,
  });
});

// POST /api/v1/paypal/create-order - Create a new PayPal order
router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        error: "Invalid amount provided",
      });
    }

    const formattedAmount = Number(amount).toFixed(2);
    const currencyCode = currency || "USD";

    const response = await ordersController.createOrder({
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: currencyCode,
              value: formattedAmount,
            },
          },
        ],
      },
      prefer: "return=representation",
    });

    const rawData =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.result || {};

    return res.status(200).json({
      id: rawData.id || response.result?.id,
      status: rawData.status || response.result?.status,
      links: rawData.links || response.result?.links || [],
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const errorBody = error.result || {};
    const details =
      errorBody.details ||
      errorBody.message ||
      error.message ||
      "Failed to create paypal order";

    return res.status(statusCode).json({
      error: "Failed to create paypal order",
      details,
      debug_id: errorBody.debug_id || error.debug_id || undefined,
    });
  }
});

// Helper function to extract capture data from order response
function formatCaptureData(order) {
  const payer = order.payer || {};
  const payerName = payer.name || {};
  const purchaseUnits = order.purchase_units || order.purchaseUnits || [];

  const captureData = {
    id: order.id,
    status: order.status,
    update_time: order.update_time || order.updateTime || new Date().toISOString(),
  };

  if (
    payer &&
    (payer.email_address ||
      payer.emailAddress ||
      payer.payer_id ||
      payer.payerId)
  ) {
    const email = payer.email_address || payer.emailAddress;
    const payerId = payer.payer_id || payer.payerId;
    const givenName = payerName.given_name || payerName.givenName;
    const surname = payerName.surname;

    captureData.payer = {
      email_address: email,
      emailAddress: email,
      payer_id: payerId,
      payerId: payerId,
      name:
        givenName || surname
          ? {
              given_name: givenName,
              givenName: givenName,
              surname: surname,
            }
          : undefined,
    };
  }

  if (purchaseUnits.length > 0) {
    captureData.purchase_units = purchaseUnits.map((unit) => {
      const captures =
        unit.payments?.captures ||
        unit.payments?.capture ||
        [];
      const captureItem = captures[0] || {};
      return {
        reference_id: unit.reference_id || unit.referenceId,
        amount: captureItem.amount || unit.amount,
        shipping: unit.shipping,
      };
    });
  }

  return captureData;
}

// POST /api/v1/paypal/capture-order - Capture an approved PayPal order
router.post("/capture-order", async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        error: "No order ID provided",
      });
    }

    let response;
    try {
      response = await ordersController.captureOrder({
        id: orderId,
        prefer: "return=representation",
      });
    } catch (captureErr) {
      // If order was already captured, fetch order details instead of failing
      const issues = captureErr.result?.details || [];
      const isAlreadyCaptured = issues.some(
        (issue) => issue.issue === "ORDER_ALREADY_CAPTURED",
      );

      if (isAlreadyCaptured) {
        const existingOrder = await ordersController.getOrder({ id: orderId });
        const rawOrder =
          typeof existingOrder.body === "string"
            ? JSON.parse(existingOrder.body)
            : existingOrder.result || {};
        return res.status(200).json(formatCaptureData(rawOrder));
      }

      throw captureErr;
    }

    const rawData =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.result || {};

    const captureData = formatCaptureData(rawData);
    return res.status(200).json(captureData);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const errorBody = error.result || {};
    const details =
      errorBody.details ||
      errorBody.message ||
      error.message ||
      "Failed to capture paypal order";

    return res.status(statusCode).json({
      error: "Failed to capture paypal order",
      details,
      debug_id: errorBody.debug_id || error.debug_id || undefined,
      links: errorBody.links || error.links || undefined,
    });
  }
});

// GET /api/v1/paypal/order/:orderId - Get details of an existing order
router.get("/order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const response = await ordersController.getOrder({ id: orderId });
    const rawData =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.result || {};

    return res.status(200).json(rawData);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const errorBody = error.result || {};
    return res.status(statusCode).json({
      error: "Failed to fetch PayPal order",
      details: errorBody.details || errorBody.message || error.message,
    });
  }
});

module.exports = router;

