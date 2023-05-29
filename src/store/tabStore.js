import { configureStore } from "@reduxjs/toolkit";
import tabSlice from "../reducer/tabSlice";

const tabStore = configureStore({
  reducer: {
    tab: tabSlice
  }
});


export { tabStore };