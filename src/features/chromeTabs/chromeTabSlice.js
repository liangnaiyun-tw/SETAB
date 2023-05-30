import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

/*global chrome*/

const initState = {
  isLoading: false,
  fetchTabs: []
};

async function getMemory(processes, thunkAPI) {
  if (thunkAPI.getState().chromeTabs.isLoading) return;
  console.log("SETTING TRUE");
  thunkAPI.dispatch(chromeTabSlice.actions.setFetchLoadingStatus(true));

  let tabsInCurrentWindow = await chrome.tabs.query({});
  let tabTasks = await Promise.allSettled(Object.values(tabsInCurrentWindow).map(async (tab) => {
    try {
      let pid = await chrome.processes.getProcessIdForTab(tab.id);
      let process = await chrome.processes.getProcessInfo(pid, true);
      process = Object.values(process)[0];
      return {
        alias: tab.title,
        title: tab.title,
        status: "complete",
        tabUrl: tab.url ? tab.url : tab.pendingUrl,
        tabIconURL: tab.favIconUrl,
        privateMemory: process.privateMemory,
        windowIndex: tab.index,
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  }));
  tabTasks = tabTasks.map(tab => tab.value).filter(tab => tab != null);
  tabTasks.sort(function (a, b) {
    return a.privateMemory - b.privateMemory;
  });

  thunkAPI.dispatch(updateTabs({
    tabs: tabTasks
  }));

  console.log("SETTING FALSE");
  thunkAPI.dispatch(chromeTabSlice.actions.setFetchLoadingStatus(false));
}

const fetchTabs = createAsyncThunk('fetchTabs', async (_, thunkAPI) => {
  const processesListener = (processes) => { getMemory(processes, thunkAPI) };
  chrome.processes.onUpdatedWithMemory.addListener(processesListener);
  return () => {
    chrome.processes.onUpdatedWithMemory.removeListener(processesListener);
  }
});

const chromeTabSlice = createSlice({
  name: "chromeTab",
  initialState: initState,
  reducers: {
    setFetchLoadingStatus: (state, action) => {
      state.isLoading = action.payload;
    },
    updateTabs: (state, action) => {
      const { tabs } = action.payload;
      state.fetchTabs = tabs;
    },
    insertTabs: (state, action) => {
      const { tabs } = action.payload;
      state.fetchTabs.push(...tabs);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTabs, (state, action) => {
        console.log(action);
      });
  }
});

export const { updateTabs, insertTabs, switchGroup } = chromeTabSlice.actions;
export { fetchTabs };
export default chromeTabSlice.reducer;