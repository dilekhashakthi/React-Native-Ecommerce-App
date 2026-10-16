import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import { Link } from "expo-router";
import Rating from "./Rating";
import { Colors } from "../constants/Utils";
import { BASE_URL } from "../constants//Urls";

const Product = ({ product }) => {
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    const fullUrl = `${BASE_URL}${imagePath}`;
    return fullUrl;
  };

  return (
    <Link
      href={{ pathname: "/ProductScreen", params: { productId: product._id } }}
      asChild
    >
      <TouchableOpacity activeOpacity={0.8} style={styles.container}>
        <View style={styles.imageWrapper}>
          <Image
            style={styles.image}
            source={{ uri: getImageUrl(product.image) }}
            resizeMode="contain"
            onError={(e) => {
              console.log("Product - image load error", e.nativeEvent.error);
              console.log("Product - failed url", getImageUrl(product.image));
            }}
          />
        </View>

        <View style={styles.infoArea}>
          <Text
            style={styles.productName}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {product.name}
          </Text>
        </View>

        <View style={styles.pricing}>
          <Text style={styles.currentPrice}>${product.price}</Text>
          <View
            style={[
              styles.availability,
              product.countInStock > 0 ? styles.available : styles.unavailable,
            ]}
          >
            <Text style={styles.availabilityText}>
              {product.countInStock > 0 ? "In Stock" : "Sold Out"}
            </Text>
          </View>
        </View>

        <View style={styles.ratingRow}>
          <Rating
            value={product.rating}
            text={`${product.numReviews} reviews`}
          />
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default Product;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 0,
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 6,
    shadowColor: Colors.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  imageWrapper: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 160,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  infoArea: {
    paddingTop: 10,
    paddingHorizontal: 2,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textColor,
    marginBottom: 8,
    minHeight: 38,
    lineHeight: 19,
  },
  pricing: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
  },
  availability: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: "500",
    color: Colors.white,
  },
  available: {
    backgroundColor: Colors.inStock,
  },
  unavailable: {
    backgroundColor: Colors.soldOut,
  },
  ratingRow: {
    marginTop: 6,
  },
});
