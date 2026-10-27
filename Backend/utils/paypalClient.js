const dotenv = require("dotenv");
dotenv.config();
const Paypal = require("@paypal/paypal-server-sdk");

if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
  throw new Error(
    "Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your .env file",
  );
}

const environment =
  process.env.NODE_ENV === "production"
    ? new Paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET,
    )
    : new Paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET,
    );

const client = new Paypal.core.PayPalHttpClient(environment);

module.exports = client;
