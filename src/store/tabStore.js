import { configureStore } from "@reduxjs/toolkit";
import { tabReducer } from "../reducer/tabReducer";

const tabStore = configureStore({
  reducer: {
    tab: tabReducer
  }
});


export { tabStore };