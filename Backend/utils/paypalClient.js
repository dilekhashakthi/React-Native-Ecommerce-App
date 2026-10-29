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

const environment =
  process.env.NODE_ENV === "production"
    ? Environment.Production
    : Environment.Sandbox;

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.PAYPAL_CLIENT_ID || "",
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
  },
  timeout: 0,
  environment: environment,
  logging: {
    logLevel:
      process.env.NODE_ENV === "production" ? LogLevel.Warn : LogLevel.Info,
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
