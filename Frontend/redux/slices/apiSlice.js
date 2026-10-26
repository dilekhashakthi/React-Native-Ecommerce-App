import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants/Urls";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
});

export const apiSlice = createApi({
  baseQuery: baseQuery,
  tagTypes: ["Product", "User"],
  endpoints: (builder) => ({}),
});
