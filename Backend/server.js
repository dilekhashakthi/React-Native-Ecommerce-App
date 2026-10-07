const express = require("express");
const routes = require("./routes/index");
const connectDB = require("./config/db");
const cors = require('cors');
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 9090;

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/api/v1", routes);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on ${PORT}`);
});
