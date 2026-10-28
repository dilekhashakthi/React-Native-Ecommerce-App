import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../constants/Utils";

const OrderDetails = ({ order }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Shipping Details</Text>
      <Text style={styles.text}>
        <Text style={styles.strongText}>Name:</Text> {order.user?.name}
      </Text>
      <Text style={styles.text}>
        <Text style={styles.strongText}>Email:</Text>{" "}
        <Text style={styles.linkText}>{order.user?.email}</Text>
      </Text>
      <Text style={styles.text}>
        <Text style={styles.strongText}>Address:</Text>{" "}
        {order.shippingAddress?.address}, {order.shippingAddress?.city}{" "}
        {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
      </Text>
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
  linkText: {
    color: Colors.primary,
    textDecorationLine: "underline",
  },
});

export default OrderDetails;
