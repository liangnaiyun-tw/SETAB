import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { updateTab, updateUnsavedWorkspace } from "../firebase/firestore/firestoreSlice";
import { v4 as uuidv4 } from "uuid";

/*global chrome*/

const initState = {
  isLoading: false,
  isDataModified: false,
  fetchTabs: []
};

async function getMemory(thunkAPI) {
  if (thunkAPI.getState().chromeTabs.isLoading) return;
  thunkAPI.dispatch(setFetchLoadingStatus(true));

  let tabsInWindows = await chrome.tabs.query({});
  let tabs = await Promise.allSettled(Object.values(tabsInWindows).map(async (tab) => {
    let tabInFirebase = thunkAPI.getState().firestore.tabs.find((tabInformation) => {
      if (tabInformation.alias === tab.title || tabInformation.title === tab.title) {
        if (tab.windowId === tabInformation.windowId && tab.id === tabInformation.tabId) {
          return true;
        }
      }
      return false;
    });

    return {
      id: tabInFirebase ? tabInFirebase.id : uuidv4(),
      alias: tabInFirebase ? tabInFirebase.alias : tab.title,
      title: tab.title,
      status: tab.status === "unloaded" ? "unloaded" : "complete",
      group: tabInFirebase ? tabInFirebase.group : thunkAPI.getState().firestore.workspaces[0].id,
      tabId: tab.id,
      windowId: tab.windowId,
      tabUrl: tab.url && tab.url.length > 0 ? tab.url : tab.pendingUrl,
      tabIconUrl: tab.favIconUrl && tab.favIconUrl.length > 0 ? tab.favIconUrl : "",
      privateMemory: 0,
      windowIndex: tab.index,
      uid: thunkAPI.getState().firestore.user // TODO: Change user to uid
    };
  }));
  tabs = tabs.map(tab => tab.value);

  let processes = await Promise.allSettled(tabs.map(async (tab) => {
    try {
      if (tab.status === "unloaded") return null;
      let pid = await chrome.processes.getProcessIdForTab(tab.tabId);
      let process = await chrome.processes.getProcessInfo(pid, true);
      if (typeof pid !== "number" || Object.keys(process).length === 0) return null;
      return Object.values(process)[0];
    } catch (err) {
      console.error(err);
      return null;
    }
  }));

  processes.map(process => process.value).filter(process => process !== null).forEach(async (process) => {
    let index = tabs.findIndex(tab => tab.tabId === process.tasks[0].tabId);
    if (index >= 0) {
      tabs[index].privateMemory = process.privateMemory;
    }
  });

  if (thunkAPI.getState().chromeTabs.isDataModified) {
    thunkAPI.dispatch(setDataModified(false));
  } else {
    console.log(tabs);

    tabs.filter(tab => tab.group !== thunkAPI.getState().firestore.workspaces[0].id).forEach(tab => {
      thunkAPI.dispatch(updateTab(tab));
    });
    thunkAPI.dispatch(updateUnsavedWorkspace({
      tabs: tabs.filter((tab) => tab.group === thunkAPI.getState().firestore.workspaces[0].id)
    }));


    tabs.sort(function (a, b) {
      return a.privateMemory - b.privateMemory;
    });
    thunkAPI.dispatch(updateChromeTabs({
      tabs: tabs
    }));
  }
  thunkAPI.dispatch(setFetchLoadingStatus(false));
}

const fetchTabs = createAsyncThunk('chromeTabs/fetchTabs', async (_, thunkAPI) => {
  const processesListener = (processes) => { getMemory(thunkAPI) };
  /*Must use onUpdateWithMemory to get the privateMemory*/
  chrome.processes.onUpdatedWithMemory.addListener(processesListener);
  return () => {
    chrome.processes.onUpdatedWithMemory.removeListener(processesListener);
  }
});

const freezeChromeTab = createAsyncThunk('chromeTabs/clickFreezeTab', async (currentTab, thunkAPI) => {
  try {
    let tab = await chrome.tabs.discard(currentTab.tabId);
    if (tab !== undefined) {
      thunkAPI.dispatch(freezeTab({
        ...currentTab,
        newTab: tab
      }));
    }
  } catch (err) {
    console.error(err);
  }
});

const reloadChromeTab = createAsyncThunk('chromeTabs/reloadChromeTab', async (currentTab, thunkAPI) => {
  try {
    await chrome.windows.update(
      currentTab.windowId,
      {
        focused: true
      }
    );
    await chrome.tabs.highlight({
      windowId: currentTab.windowId,
      tabs: currentTab.windowIndex
    });
    thunkAPI.dispatch(reloadTab(currentTab));
  } catch (err) {
    console.error(err);
  }
});

const closeChromeTab = createAsyncThunk('chromeTabs/closeChromeTab', async (currentTab, thunkAPI) => {
  try {
    await chrome.tabs.remove(currentTab.tabId);
    thunkAPI.dispatch(deleteTab(currentTab));
  } catch (err) {
    console.error(err);
  }
});

const chromeTabSlice = createSlice({
  name: "chromeTabs",
  initialState: initState,
  reducers: {
    setFetchLoadingStatus: (state, action) => {
      state.isLoading = action.payload;
    },
    setDataModified: (state, action) => {
      console.log(action);
      state.isDataModified = action.payload;
    },
    updateChromeTabs: (state, action) => {
      const { tabs } = action.payload;
      state.fetchTabs = tabs;
    },
    reloadTab: (state, action) => {
      let index = state.fetchTabs.findIndex((tab) => {
        return tab.tabId === action.payload.tabId;
      });
      if (index >= 0) {
        state.fetchTabs[index].status = "complete";
      }
      state.isDataModified = true;
    },
    freezeTab: (state, action) => {
      let index = state.fetchTabs.findIndex((tab) => {
        return tab.tabId === action.payload.tabId;
      });
      if (index >= 0) {
        state.fetchTabs[index].tabId = action.payload.newTab.id;
        state.fetchTabs[index].status = "unloaded";
        state.fetchTabs[index].privateMemory = 0;
      }
      state.isDataModified = true;
    },
    deleteTab: (state, action) => {
      let index = state.fetchTabs.findIndex((tab) => {
        return tab.tabId === action.payload.tabId;
      })
      if (index >= 0) {
        for (let i = index + 1; i < state.fetchTabs.length; ++i) {
          state.fetchTabs[i].windowIndex--;
        }
        state.fetchTabs.splice(index, 1);
      }
      state.fetchTabs.sort((a, b) => a.privateMemory - b.privateMemory);
      state.isDataModified = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTabs.fulfilled, (state, action) => {
        console.log(action);
      })
      .addCase(fetchTabs.rejected, (state, action) => {
        console.log(action);
      })
      .addCase(freezeChromeTab.fulfilled, (state, action) => {
        console.log(action);
      })
      .addCase(freezeChromeTab.rejected, (state, action) => {
        console.log(action);
      })
      .addCase(closeChromeTab.fulfilled, (state, action) => {
        console.log(action);
      })
      .addCase(closeChromeTab.rejected, (state, action) => {
        console.log(action);
      })
      .addCase(reloadChromeTab.fulfilled, (state, action) => {
        console.log(action);
      })
      .addCase(reloadChromeTab.rejected, (state, action) => {
        console.log(action);
      });
  }
});

export const { setFetchLoadingStatus, setDataModified, updateChromeTabs, reloadTab, freezeTab, switchGroup, deleteTab } = chromeTabSlice.actions;
export { fetchTabs, freezeChromeTab, reloadChromeTab, closeChromeTab };
export default chromeTabSlice.reducer;