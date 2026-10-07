const mongoose = require("mongoose");
const dotenv = require("dotenv");

const users = require("./data/users");
const products = require("./data/products");

const User = require("./models/userModel");
const Product = require("./models/productModel");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();

    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUser };
    });

    await Product.insertMany(sampleProducts);
    console.log("Data imported successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error occurred while importing data:", error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();

    console.log("Data destroyed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error occurred while destroying data:", error);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
