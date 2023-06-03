import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { updateUnsavedWorkspace } from "../firebase/firestore/firestoreSlice";
import { v4 as uuidv4 } from "uuid";

/*global chrome*/

const initState = {
  isLoading: false,
  fetchTabs: []
};

function getMemory(thunkAPI) {
  if (thunkAPI.getState().chromeTabs.isLoading) return;
  thunkAPI.dispatch(setFetchLoadingStatus(true));

  chrome.tabs.query({})
    .then((tabsInWindows) => {
      Promise.allSettled(Object.values(tabsInWindows).map(async (tab) => {
        try {
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

          if (tab.status !== "unloaded") {
            let pid = await chrome.processes.getProcessIdForTab(tab.id);
            let process = await chrome.processes.getProcessInfo(pid, true);
            if (typeof pid !== "number" || Object.keys(process).length === 0) return null;
            process = Object.values(process)[0];

            return {
              id: tabInFirebase ? tabInFirebase.id : uuidv4(),
              alias: tab.title,
              title: tab.title,
              status: "complete",
              group: tabInFirebase ? tabInFirebase.group : thunkAPI.getState().firestore.workspaces[0].id,
              tabId: tab.id,
              windowId: tab.windowId,
              tabUrl: tab.url ? tab.url : tab.pendingUrl,
              tabIconUrl: tab.favIconUrl,
              privateMemory: process.privateMemory,
              windowIndex: tab.index,
            };
          } else {
            return {
              id: tabInFirebase ? tabInFirebase.id : uuidv4(),
              alias: tabInFirebase ? tabInFirebase.alias : tab.title,
              title: tab.title,
              status: "unloaded",
              group: tabInFirebase ? tabInFirebase.group : thunkAPI.getState().firestore.workspaces[0].id,
              tabId: tab.id,
              windowId: tab.windowId,
              tabUrl: tab.url ? tab.url : tab.pendingUrl,
              tabIconUrl: tab.favIconUrl,
              privateMemory: 0,
              windowIndex: tab.index,
            };
          }
        } catch (err) {
          console.error(err);
          return null;
        }
      })).then((tabTasks) => {
        tabTasks = tabTasks.map(tab => tab.value).filter(tab => tab != null);
        tabTasks.sort(function (a, b) {
          return a.privateMemory - b.privateMemory;
        });
        console.log(tabTasks);

        thunkAPI.dispatch(updateTabs({
          tabs: tabTasks
        }));
        thunkAPI.dispatch(updateUnsavedWorkspace({
          tabs: tabTasks.filter((tab) => tab.group === thunkAPI.getState().firestore.workspaces[0].id)
        }));

        thunkAPI.dispatch(setFetchLoadingStatus(false));
      });
    })
    .catch((err) => {
      console.error(err);
      return [];
    });
}

const fetchTabs = createAsyncThunk('chromeTabs/fetchTabs', async (_, thunkAPI) => {
  const processesListener = (processes) => { getMemory(thunkAPI) };
  /*Must use onUpdateWithMemory to get the privateMemory*/
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
    freezeTab: (state, action) => {
      console.log("FREEZE EVENT");
      console.log(action.payload);
      let index = state.fetchTabs.findIndex((tab) => {
        return tab.tabId === action.payload.tabId;
      });
      if (index >= 0) {
        state.fetchTabs[index].status = "unloaded";
        state.fetchTabs[index].privateMemory = 0;
      }
    },
    deleteTab: (state, action) => {
      console.log("CLOSE TABS");
      console.log(action.payload);
      let index = state.fetchTabs.findIndex((tab) => {
        return tab.windowId === action.payload.windowId && tab.windowIndex === action.payload.windowIndex;
      })
      if (index >= 0) {
        state.fetchTabs.splice(index, 1);
      }
      state.fetchTabs.sort((a, b) => a.privateMemory - b.privateMemory);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTabs, (state, action) => {
        console.log(action);
      });
  }
});

export const { setFetchLoadingStatus, updateTabs, freezeTab, switchGroup, deleteTab } = chromeTabSlice.actions;
export { fetchTabs };
export default chromeTabSlice.reducer;