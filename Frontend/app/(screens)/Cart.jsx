import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  Platform,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import Message from "../../components/Message";
import { addToCart, removeFromCart } from "../../redux/slices/cartSlice";
import { Colors } from "../../constants/Utils";

const Cart = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cartItems
    .reduce((acc, item) => acc + item.qty * item.price, 0)
    .toFixed(2);

  const updateQuantity = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const deleteItem = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handlerCheckout = () => {
    if (userInfo) {
      router.push("(screens)/ShippingScreen");
    } else {
      router.push({
        pathname: "(screens)/LoginScreen",
        params: {
          redirect: "(screens)/ShippingScreen",
        },
      });
    }
  };

  const renderItem = ({ item }) => {
    const maxQty = Math.max(
      Number(item.countInStock) > 0 ? Number(item.countInStock) : 10,
      Number(item.qty) || 1,
    );

    return (
      <View style={styles.itemContainer}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <View style={styles.itemDetails}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "(screens)/ProductScreen",
                params: { productId: item._id },
              })
            }
          >
            <Text style={styles.itemName}>
              {item.name.split(" ").slice(0, 2).join(" ") +
                (item.name.split(" ").length > 2 ? "..." : "")}
            </Text>
          </TouchableOpacity>
          <Text style={styles.itemPrice}>${item.price}</Text>
        </View>
        <View style={styles.itemActions}>
          <View style={styles.pickerSquare}>
            <View style={styles.pickerContent} pointerEvents="none">
              <Text style={styles.qtyText} numberOfLines={1}>
                {item.qty}
              </Text>
              <Ionicons name="caret-down" size={12} color={Colors.darkGray} />
            </View>
            <Picker
              selectedValue={Number(item.qty)}
              onValueChange={(value) => updateQuantity(item, Number(value))}
              style={styles.hiddenPicker}
              dropdownIconColor="transparent"
              mode="dropdown"
            >
              {[...Array(maxQty).keys()].map((x) => (
                <Picker.Item
                  key={x + 1}
                  label={`${x + 1}`}
                  value={x + 1}
                  color={Colors.darkGray}
                />
              ))}
            </Picker>
          </View>

          <TouchableOpacity
            style={styles.removeIcon}
            onPress={() => deleteItem(item._id)}
          >
            <Ionicons name="trash" size={20} color={Colors.textRed} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back-circle"
              size={40}
              color={Colors.primary}
            />
          </TouchableOpacity>
          <Text style={styles.header}>Shopping Cart</Text>
        </View>

        {cartItems.length === 0 ? (
          <Message variant="info" style={styles.emptyMessage}>
            Your cart is empty{" "}
            <Text style={styles.backLink} onPress={() => router.back()}>
              Go back
            </Text>
          </Message>
        ) : (
          <View style={styles.content}>
            <FlatList
              data={cartItems}
              keyExtractor={(item, index) => item._id || index.toString()}
              renderItem={renderItem}
              style={styles.listContainer}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={true}
            />

            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.label}>Items: </Text>
                <Text style={styles.value}>{totalItems}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.label}>Total: </Text>
                <Text style={styles.value}>${totalPrice}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.checkoutButton,
                  cartItems.length === 0 && styles.checkoutDisabled,
                ]}
                onPress={handlerCheckout}
                disabled={cartItems.length === 0}
              >
                <Text style={styles.checkoutButtonText}>
                  Proceed to Checkout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Cart;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    paddingTop: Platform.OS === "android" ? 35 : 0,
  },
  container: {
    paddingHorizontal: 20,
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
    gap: 10,
  },
  backButton: {
    padding: 0,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.primary,
  },
  emptyMessage: {
    marginTop: 20,
    padding: 20,
    backgroundColor: Colors.infoBorder,
    borderColor: Colors.infoBorder,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
  },
  backLink: {
    color: Colors.primary,
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  list: {
    paddingBottom: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 12,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemImage: {
    width: 75,
    height: 75,
    resizeMode: "contain",
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "center",
    marginRight: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textColor,
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  pickerSquare: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 52,
    height: 42,
    paddingHorizontal: 8,
    position: "relative",
  },
  pickerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.darkGray,
  },
  hiddenPicker: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    opacity: 0.015,
  },
  removeIcon: {
    marginLeft: 8,
    padding: 6,
  },
  summary: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 10,
    borderColor: Colors.lightGray,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: Platform.OS === "ios" ? 10 : 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.darkGray,
    textAlign: "center",
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: Colors.secondaryTextColor,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.darkGray,
  },
  total: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textColor,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  checkoutButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  checkoutDisabled: {
    backgroundColor: Colors.darkGray,
  },
});
