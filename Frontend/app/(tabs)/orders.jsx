import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import { useRouter, useFocusEffect } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useGetMyOrdersQuery } from "../../redux/slices/ordersApiSlice";
import { Colors } from "../../constants/Utils";
import Message from "../../components/Message";

const orders = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: orders, isLoading, error, refetch } = useGetMyOrdersQuery();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handleLoginPress = () => {
    router.push("/LoginScreen");
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/profile");
    }
  };

  if (!userInfo) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleGoBack}
            >
              <Ionicons
                name="arrow-back-circle"
                size={40}
                color={Colors.primary}
              />
            </TouchableOpacity>
            <Text style={styles.title}>My Orders</Text>
          </View>
          <View style={[styles.container, styles.messageContainer]}>
            <Message variant="info">
              <Text style={styles.messageText}>
                Please{" "}
                <Text style={styles.loginLink} onPress={handleLoginPress}>
                  Login
                </Text>{" "}
                to see your orders
              </Text>
            </Message>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (orders && orders.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleGoBack}
            >
              <Ionicons
                name="arrow-back-circle"
                size={40}
                color={Colors.primary}
              />
            </TouchableOpacity>
            <Text style={styles.title}>My Orders</Text>
          </View>
          <View style={[styles.container, styles.messageContainer]}>
            <Message variant="info">
              <Text style={styles.messageText}>You have not any orders yet</Text>
            </Message>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <Ionicons
              name="arrow-back-circle"
              size={40}
              color={Colors.primary}
            />
          </TouchableOpacity>
          <Text style={styles.title}>My Orders</Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 1 }]}>#</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Total</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Paid</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Delivered</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>View</Text>
        </View>

        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item: order, index }) => (
            <View style={styles.tableRow}>
              <Text style={[styles.cell, { flex: 1 }]}>{index + 1}</Text>
              <Text style={[styles.cell, { flex: 1 }]}>
                ${order.totalPrice}
              </Text>
              <View
                style={[
                  styles.cell,
                  { flex: 2, alignItems: "center", justifyContent: "center" },
                ]}
              >
                {order.isPaid ? (
                  <Text style={styles.statusTextSuccess}>
                    {order.paidAt ? order.paidAt.substring(0, 10) : "Paid"}
                  </Text>
                ) : (
                  <FontAwesome name="times" size={16} color={Colors.textRed} />
                )}
              </View>

              <TouchableOpacity
                style={[styles.cell, { flex: 1 }]}
                onPress={() =>
                  router.push({
                    pathname: "(screens)/OrderScreen",
                    params: { orderId: order._id },
                  })
                }
              >
                <FontAwesome name="eye" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default orders;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    paddingTop: Platform.OS === "android" ? 20 : 0,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.offWhite,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 10,
  },
  backButton: {
    padding: 0,
  },
  messageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.primary,
  },

  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    paddingVertical: 10,
    marginBottom: 8,
  },
  headerCell: {
    fontWeight: "bold",
    color: Colors.textColor,
    textAlign: "center",
    fontSize: 14,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  cell: {
    textAlign: "center",
    fontSize: 14,
    color: Colors.textColor,
  },
  statusTextSuccess: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: "500",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messageText: {
    fontSize: 16,
    textAlign: "center",
    color: Colors.textColor,
  },
  loginLink: {
    color: Colors.primary,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
