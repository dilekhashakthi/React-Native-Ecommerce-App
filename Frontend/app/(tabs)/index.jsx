import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from "react-native";
import React, { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import Product from "../../components/Product";
import Message from "../../components/Message";
import Header from "../../components/Header";
import { Colors } from "../../constants/Utils";
import { useGetProductsQuery } from "../../redux/slices/productApiSlice";

const Home = () => {
  const { keyword = "", pageNumber = "1" } = useLocalSearchParams();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useGetProductsQuery({
    keyword,
    pageNumber: Number(pageNumber),
  });

  useEffect(() => {
    refetch();
  }, [keyword, pageNumber, refetch]);

  const renderPaginationButtons = () => {
    if (!data?.pages || data.pages.length <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        {Array.from({ length: data.pages }, (_, index) => index + 1).map(
          (page) => (
            <TouchableOpacity
              key={page}
              style={[
                styles.pageButton,
                page === data.page && styles.activePageButton,
              ]}
              onPress={() => {
                router.setParams({
                  pageNumber: page.toString(),
                  ...(keyword ? { keyword } : {}),
                });
              }}
            >
              <Text
                style={[
                  styles.pageButtonText,
                  page === data.page && styles.activePageButtonText,
                ]}
              >
                {page}
              </Text>
            </TouchableOpacity>
          ),
        )}
      </View>
    );
  };

  const ListHeader = () => (
    <>
      <Header />
      {error && (
        <Message variant="error" style={styles.errorMessage}>
          {error?.data?.message || error?.error || "Failed to fetch products."}
        </Message>
      )}
    </>
  );

  const ListFooter = () => renderPaginationButtons();

  return (
    <SafeAreaView style={styles.safeArea}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={data?.products}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <Product product={item} />}
          contentContainerStyle={styles.list}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={
            !error && (
              <Message variant="info" style={styles.emptyMessage}>
                No products found.
              </Message>
            )
          }
        />
      )}
    </SafeAreaView>
  );
};
export default Home;

const styles = StyleSheet.create({});
