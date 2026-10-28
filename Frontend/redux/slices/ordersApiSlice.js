import { apiSlice } from "./apiSlice";
import {
  ORDERS_URL,
  PAYPAL_API_URL,
  PAYPAL_CONFIG_URL,
} from "../../constants/Urls";

export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: "POST",
        body: order,
      }),
    }),

    getOrderDetails: builder.query({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}`,
      }),
      keepUnusedDataFor: 5,
    }),

    payOrder: builder.mutation({
      query: ({ orderId, paypalOrderId, payerId, paymentId }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: "PUT",
        body: {
          paypalOrderId,
          payerId,
          paymentId,
        },
      }),
    }),

    createPaypalOrder: builder.mutation({
      query: (amount) => ({
        url: `${PAYPAL_API_URL}/create-order`,
        method: "POST",
        body: { amount },
      }),
    }),

    capturePaypalOrder: builder.mutation({
      query: (paypalOrderId) => ({
        url: `${PAYPAL_API_URL}/capture-order`,
        method: "POST",
        body: { orderId: paypalOrderId },
      }),
    }),

    getPaypalClientId: builder.query({
      query: () => ({ url: PAYPAL_CONFIG_URL }),
      keepUnusedDataFor: 5,
    }),

    getMyOrders: builder.query({
      query: () => ({ url: `${ORDERS_URL}/myorders` }),
      keepUnusedDataFor: 5,
    }),

    getOrders: builder.query({
      query: () => ({ url: ORDERS_URL }),
      keepUnusedDataFor: 5,
    }),

    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: "PUT",
      }),
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useGetMyOrdersQuery,
  useCreatePaypalOrderMutation,
  useCapturePaypalOrderMutation,
  useGetPaypalClientIdQuery,
  useGetOrdersQuery,
  useDeliverOrderMutation,
} = ordersApiSlice;
