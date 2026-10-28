import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Colors } from "../constants/Utils";

const OrderItems = ({ items }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Order Items</Text>
      {items.length === 0 ? (
        <Text style={styles.text}>No order items found.</Text>
      ) : (
        items.map((item) => (
          <View key={item.product} style={styles.orderItem}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
            </View>
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.text}>
                {item.qty} x ${item.price} ={" "}
                <Text style={styles.strongText}>
                  ${(item.qty * item.price).toFixed(2)}
                </Text>
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 12,
    shadowColor: Colors.darkGray,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.textColor,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: Colors.secondaryTextColor,
    lineHeight: 24,
    marginBottom: 4,
  },
  strongText: {
    fontWeight: "bold",
    color: Colors.primary,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  imageContainer: {
    width: 64,
    height: 64,
    marginRight: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "500",
    color: Colors.primary,
    marginBottom: 4,
  },
});

export default OrderItems;
