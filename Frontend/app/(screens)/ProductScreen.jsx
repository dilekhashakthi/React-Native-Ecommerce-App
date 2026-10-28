import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import Toast from "react-native-toast-message";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from "../../redux/slices/productApiSlice";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "../../constants/Utils";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { addToCart } from "../../redux/slices/cartSlice";

import Message from "../../components/Message";
import ProductImageCard from "../../components/ProductImageCard";
import ProductDetailsCard from "../../components/ProductDetailsCard";
import ProductReviewSection from "../../components/ProductReviewSection";
import AddReviewModel from "../../components/AddReviewModel";

const ProductScreen = () => {
  const router = useRouter();
  const { productId } = useLocalSearchParams();
  const dispatch = useDispatch();

  const [qty, setQty] = useState(1);
  const [isReviewModelOpen, setIsReviewModelOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { userInfo } = useSelector((state) => state.auth);

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  useEffect(() => {
    if (!productId) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          "Product id not found. Please try again or select a product from the list",
        position: "top",
        visibilityTime: 7000,
      });

      router.back();
    }
  }, [productId, router]);

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    const errorMessage =
      error?.data?.message ||
      error?.error ||
      "Something went wrong. Please try again.";

    return (
      <View style={styles.center}>
        <Message variant="error">{errorMessage}</Message>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.errorBackButton}
        >
          <Text style={styles.errorBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Message variant="info">No product data available</Message>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.errorBackButton}
        >
          <Text style={styles.errorBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({ ...product, qty }));
      router.push("/(screens)/Cart");
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          "Product data not loaded yet. Can't add to cart. Please try again.",
        position: "top",
        visibilityTime: 7000,
      });
    }
  };

  // const disabledAddToCart = product?.countInStock === 0;

  const submitReviewHandler = async () => {
    try {
      if (!rating || rating === 0) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please provide a rating before submitting the review.",
          position: "top",
          visibilityTime: 7000,
        });
        return;
      }

      if (!comment.trim()) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please provide a comment before submitting the review.",
          position: "top",
          visibilityTime: 7000,
        });
        return;
      }

      await createReview({
        productId,
        rating,
        comment,
      }).unwrap();

      refetch();

      Toast.show({
        type: "success",
        text1: "Review Submitted",
        text2: "Your review has been submitted successfully.",
        position: "top",
        visibilityTime: 7000,
      });

      setRating(0);
      setComment("");
      setIsReviewModelOpen(false);
    } catch (error) {
      const errorMessage =
        error?.data?.message ||
        error?.error ||
        "Something went wrong. Please try again.";
      if (errorMessage.toLowerCase().includes("already reviewed")) {
        setIsReviewModelOpen(false);
      }
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
        position: "top",
        visibilityTime: 7000,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back-circle" size={40} color={Colors.primary} />
        </TouchableOpacity>
        <ProductImageCard imageUrl={product.image} />
        <ProductDetailsCard
          product={product}
          qty={qty}
          setQty={setQty}
          handleAddToCart={handleAddToCart}
          disableAddToCart={product?.countInStock === 0}
        />

        <ProductReviewSection
          reviews={product.reviews}
          userInfo={userInfo}
          onAddReviewPress={() => setIsReviewModelOpen(true)}
        />
      </ScrollView>

      <AddReviewModel
        isVisible={isReviewModelOpen}
        onClose={() => setIsReviewModelOpen(false)}
        rating={rating}
        setRating={setRating}
        comment={comment}
        setComment={setComment}
        onSubmit={submitReviewHandler}
        isLoading={loadingProductReview}
      />
    </SafeAreaView>
  );
};

export default ProductScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.offWhite,
    padding: 20,
  },
  errorBackButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  errorBackButtonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 16,
  },
  container: {
    padding: 18,
    paddingBottom: 30,
  },
  backButton: {
    marginVertical: 10,
    alignSelf: "flex-start",
  },
});
