const express = require("express");
const routes = require("./routes/index");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 9090;

const app = express();

app.use(express.json());

app.use("/api/v1", routes);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on ${PORT}`);
});
