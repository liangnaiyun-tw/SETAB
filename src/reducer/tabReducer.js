import { createReducer } from "@reduxjs/toolkit";
import { updateTabs } from "../action/tabAction";


const initState = {
  tabs: []
};

const tabReducer = createReducer(initState, (builder) => {
  builder
    .addCase(updateTabs, (state, action) => {
      state.tabs = action.payload;
    });
});


export { tabReducer };