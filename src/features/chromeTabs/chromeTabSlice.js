import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { updateUnsavedWorkspace } from "../firebase/firestore/firestoreSlice";
import { v4 as uuidv4 } from "uuid";

/*global chrome*/

const initState = {
  isLoading: false,
  fetchTabs: []
};

async function getMemory(processes, thunkAPI) {
  if (thunkAPI.getState().chromeTabs.isLoading) return;
  thunkAPI.dispatch(chromeTabSlice.actions.setFetchLoadingStatus(true));

  let tabsInWindows = await chrome.tabs.query({});
  let tabTasks = await Promise.allSettled(Object.values(tabsInWindows).map(async (tab) => {
    try {
      let pid = await chrome.processes.getProcessIdForTab(tab.id);
      let process = await chrome.processes.getProcessInfo(pid, true);
      process = Object.values(process)[0];
      let tabInFirebase = thunkAPI.getState().firestore.tabs.find((tabInformation) => {
        if (tabInformation.alias === tab.title || tabInformation.title === tab.title) {
          for (let i = 0; i < tabInformation.tabId.length; ++i) {
            if (tab.windowId === tabInformation.windowId[i] && tab.id === tabInformation.tabId[i]) {
              return true;
            }
          }
        }
        return false;
      });

      return {
        id: tabInFirebase ? tabInFirebase.id : uuidv4(),
        alias: tab.title,
        title: tab.title,
        status: "complete",
        group: tabInFirebase ? tabInFirebase.group : "Unsaved",
        tabId: tab.id,
        windowId: tab.windowId,
        tabUrl: tab.url ? tab.url : tab.pendingUrl,
        tabIconUrl: tab.favIconUrl,
        privateMemory: process.privateMemory,
        windowIndex: tab.index,
      };
    } catch (err) {
      return null;
    }
  }));
  console.log(tabTasks);
  tabTasks = tabTasks.map(tab => tab.value).filter(tab => tab != null);
  tabTasks.sort(function (a, b) {
    return a.privateMemory - b.privateMemory;
  });

  thunkAPI.dispatch(updateTabs({
    tabs: tabTasks
  }));
  thunkAPI.dispatch(updateUnsavedWorkspace({
    tabs: tabTasks.filter((tab) => tab.group === "Unsaved")
  }));

  thunkAPI.dispatch(chromeTabSlice.actions.setFetchLoadingStatus(false));
}

const fetchTabs = createAsyncThunk('chromeTabs/fetchTabs', async (_, thunkAPI) => {
  const processesListener = (processes) => { getMemory(processes, thunkAPI) };
  chrome.processes.onUpdatedWithMemory.addListener(processesListener);
  return () => {
    chrome.processes.onUpdatedWithMemory.removeListener(processesListener);
  }
});

const chromeTabSlice = createSlice({
  name: "chromeTabs",
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