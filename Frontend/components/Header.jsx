import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useState, useCallback } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "../constants/Utils";
import { useRouter, useLocalSearchParams } from "expo-router";

const Header = () => {
  const [searchText, setSearchText] = useState("");
  // const navigation = useNavigation();
  const router = useRouter();
  const { keyword = "" } = useLocalSearchParams();

  const handleSearch = useCallback(() => {
    if (searchText.trim().length >= 2 || searchText.trim().length === 0) {
      router.setParams({
        keyword: searchText.trim(),
        pageNumber: "1",
      });
    }
  }, [searchText, router]);

  const clearSearch = () => {
    setSearchText("");
    router.setParams({
      keyword: "",
      pageNumber: "1",
    });
  };

  const showAllProducts = () => {
    setSearchText("");
    router.setParams({
      keyword: "",
      pageNumber: "1",
    });
  };
  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <Image
          style={styles.logo}
          source={require("../assets/images/logo.png")}
        />
        <TouchableOpacity onPress={() => {}} style={styles.cartIconContainer}>
          <Ionicons name="cart" size={35} color={Colors.primary} />
          {/* TODO */}
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={Colors.primary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Products..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={Colors.lightGray}
            onSubmitEditing={handleSearch}
          />

          {searchText ? (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={Colors.primary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        )}
      </View>

      {keyword ? (
        <View style={styles.activeFilterRow}>
          <Text style={styles.filterText}>Showing result for: {keyword}</Text>
          <TouchableOpacity
            style={styles.showAllButton}
            onPress={showAllProducts}
          >
            <Text style={styles.showAllButtonText}>Show All Products</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.bottomRow}>
        <Text style={styles.welcomeText}>{/* TODO */}</Text>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "column",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: Colors.offWhite,
    paddingBottom: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  searchRow: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 100,
    height: 60,
    resizeMode: "contain",
  },
  searchContainer: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
  },
  searchButtonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.black,
    height: "100%",
  },
  clearButton: {
    padding: 5,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  cartIconContainer: {
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: Colors.textRed,
    borderRadius: 20,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignContent: "center",
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
  },
  activeFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  filterText: {
    color: Colors.primary,
    fontSize: 14,
    fontStyle: "italic",
  },
  showAllButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  showAllButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
});
