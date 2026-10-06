const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createdProductReview,
} = require("../controllers/product.controller");

const router = express.Router();

// api/v1/products/
router.route("/").get(getProducts).post(createProduct);

// api/v1/products/:id
router
  .route("/:id")
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

// api/v1/products/:id/reviews
router.route("/:id/reviews").post(createdProductReview);

module.exports = router;
