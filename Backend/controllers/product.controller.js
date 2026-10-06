const asyncHandle = require("../utils/asyncHandler");
const Product = require("../models/Product");

const getProducts = asyncHandler(async (req, res) => {
  const limit = 8;
  const page = Number(req.query.pageNumber) || 1;
  const skip = (page - 1) * limit;
  const search = req.query.search
    ? { name: { $regex: req.query.search, $options: "i" } }
    : {};
  const total = await Product.countDocuments({ ...search });

  const products = await Product.find({ ...search })
    .limit(limit)
    .skip(skip);

  res.json({
    products,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

const getProductById = asyncHandle(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  }
  res.status(404);
  throw new Error("Product not found");
});

const createProduct = asyncHandle(async (req, res) => {
  const createdProduct = new Product.create({
    name: "sample name",
    price: 0,
    image: "/uploads/sample.png",
    category: "sample category",
    countInStock: 0,
    numReviews: 0,
    description: "sample description",
  });

  res.send(201).json(createdProduct);
});

const updateProduct = asyncHandle(async (req, res) => {
  const { name, price, description, image, category, countInStock } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.category = category;
    product.countInStock = countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

const deleteProduct = asyncHandle(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ id: product._id });
    res.json({ message: "product deleted successfully" });
  } else {
    res.status(404);
    throw new Error("product not found");
  }
});

const createdProductReview = asyncHandle(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString(),
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Product already reviewed");
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };
    product.reviews.push(review);

    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;
    await product.save();
    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createdProductReview,
};
