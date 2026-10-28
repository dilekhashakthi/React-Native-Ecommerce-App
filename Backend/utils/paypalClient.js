const dotenv = require("dotenv");
dotenv.config();
const {
  Client,
  Environment,
  LogLevel,
  OrdersController,
  PaymentsController,
  CheckoutPaymentIntent,
} = require("@paypal/paypal-server-sdk");

if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
  console.warn(
    "Warning: PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET should be set in your .env file",
  );
}

// ─── Environment Selection ────────────────────────────────────────────────────
// When NODE_ENV="production" → uses PayPal LIVE environment (real money).
// When NODE_ENV="development" (or anything else) → uses PayPal Sandbox (test money).
//
// To go live:
//   1. Get Live credentials from https://developer.paypal.com → My Apps & Credentials → Live
//   2. Replace PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env with your Live keys
//   3. Set NODE_ENV="production" in .env
// ─────────────────────────────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === "production";
const environment = isProduction ? Environment.Production : Environment.Sandbox;

console.log(
  `[PayPal] Running in ${isProduction ? "🟢 LIVE (Production)" : "🟡 Sandbox (Development)"} mode`,
);

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.PAYPAL_CLIENT_ID || "",
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
  },
  timeout: 0,
  environment: environment,
  logging: {
    logLevel: isProduction ? LogLevel.Warn : LogLevel.Info,
    logRequest: {
      logBody: true,
    },
    logResponse: {
      logHeaders: false,
    },
  },
});

const ordersController = new OrdersController(client);
const paymentsController = new PaymentsController(client);

module.exports = {
  client,
  ordersController,
  paymentsController,
  CheckoutPaymentIntent,
  Environment,
};
