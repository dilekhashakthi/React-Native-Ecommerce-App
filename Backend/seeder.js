require("dotenv").config();

const mongoose = require("mongoose");
const users = require("./data/users");
const products = require("./data/products");

const User = require("./models/User");
const Product = require("./models/Product");
const connectDB = require("./config/db");

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

async function runSeeder() {
  await connectDB();

  if (process.argv[2] === "-d") {
    await destroyData();
  } else {
    await importData();
  }
}

runSeeder().catch((error) => {
  console.error("Seeder failed:", error.message);
  process.exit(1);
});
