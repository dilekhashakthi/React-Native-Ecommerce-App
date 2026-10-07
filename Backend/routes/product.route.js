const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
} = require("../controllers/product.controller");
const { protect, admin } = require("../middleware/auth.middleware");

const router = express.Router();

// api/v1/products/
router.route("/").get(getProducts).post(protect, admin, createProduct);

// api/v1/products/:id
router
  .route("/:id")
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

// api/v1/products/:id/reviews
router.route("/:id/reviews").post(protect, createProductReview);

module.exports = router;
