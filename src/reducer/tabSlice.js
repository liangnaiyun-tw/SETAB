import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createRandomUUID } from "../utils/hash";

/*global chrome*/

const initState = {
  /*These are fake data*/
  currentWorkspaceId: "unsaved",
  currentGroupId: "",
  workspaces: {
    unsaved: {
      groups: [
        "group-1"
      ]
    },
    workspace1: {
      groups: [
        "group-2"
      ]
    },
    workspace2: {
      groups: [
        "parent-group"
      ]
    }
  },
  groups: {
    "group-1": {
      tabs: [
        {
          tabName: "javascript - Where is redux store saved? - Stack Overflow",
          alias: "",
          tabURL: "https://stackoverflow.com/questions/38329193/where-is-redux-store-saved",
          tabIconURL: "https://developer.chrome.com/images/meta/favicon-32x32.png",
          privateMemory: 38912000,
          windowId: 1,
          windowIndex: 5,
        },
      ]
    },
    "group-2": {
      tabs: [
        {
          tabName: "javascript - Where is redux store saved? - Stack Overflow",
          tabURL: "https://stackoverflow.com/questions/38329193/",
          tabIconURL: "https://developer.chrome.com/images/meta/favicon-32x32.png",
          privateMemory: 42736000
        }
      ]
    },
    "parent-group": {
      groups: [
        "child-group"
      ]
    },
    "child-group": {
      tabs: [
        {
          tabName: "Open AI",
          tabURL: "https://chat.openai.com/?model=text-davinci-002-render-sha",
          tabIconURL: "https://developer.chrome.com/images/meta/favicon-32x32.png",
          privateMemory: 12641280
        }
      ],
    }
  }
};

let isGetMemoryRunning = false;
async function getMemory(processes, thunkAPI) {
  if (isGetMemoryRunning) return;
  isGetMemoryRunning = true;


  const currentState = thunkAPI.getState();

  let tabsInCurrentWindow = await chrome.tabs.query({});
  let tabTasks = await Promise.allSettled(Object.values(tabsInCurrentWindow).map(async (tab) => {
    try {
      let pid = await chrome.processes.getProcessIdForTab(tab.id);
      let process = await chrome.processes.getProcessInfo(pid, true);
      process = Object.values(process)[0];
      return {
        tabName: tab.title,
        tabURL: tab.url ? tab.url : tab.pendingUrl,
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

  let workspaceId = "unsaved";
  let groupId = currentState.tab.currentGroupId;
  if (groupId === "") {
    groupId = "group-" + createRandomUUID();
    thunkAPI.dispatch(insertTabs({
      workspaceId,
      groupId,
      tabs: tabTasks
    }));
  } else {
    thunkAPI.dispatch(updateTabs({
      workspaceId,
      groupId,
      tabs: tabTasks
    }));
  }
  thunkAPI.dispatch(switchGroup({
    workspaceId,
    groupId
  }));

  isGetMemoryRunning = false;
}

const fetchTabs = createAsyncThunk('fetchTabs', async (_, thunkAPI) => {
  const processesListener = (processes) => { getMemory(processes, thunkAPI) };
  chrome.processes.onUpdatedWithMemory.addListener(processesListener);
  return () => {
    chrome.processes.onUpdatedWithMemory.removeListener(processesListener);
  }
});

const tabSlice = createSlice({
  name: "tab",
  initialState: initState,
  reducers: {
    updateTabs: (state, action) => {
      const { groupId, tabs } = action.payload;
      state.groups[groupId].tabs = tabs;
      return state;
    },
    insertTabs: (state, action) => {
      const { workspaceId, groupId, tabs } = action.payload;

      if (!state.workspaces[workspaceId]) {
        state.workspaces[workspaceId] = {
          groups: []
        };
      }
      if (!state.workspaces[workspaceId].groups.includes(groupId)) {
        state.workspaces[workspaceId].groups.push(groupId);
      }

      if (!state.groups[groupId]) {
        state.groups[groupId] = {
          tabs: [],
        };
      }

      state.groups[groupId].tabs.push(...tabs);
      return state;
    },
    switchGroup: (state, action) => {
      const { workspaceId, groupId } = action.payload;
      state.currentWorkspaceId = workspaceId;
      state.currentGroupId = groupId;
      return state;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTabs, (state, action) => {
        console.log(action);
        return state;
      });
  }
});

export const { updateTabs, insertTabs, switchGroup } = tabSlice.actions;
export { fetchTabs };
export default tabSlice.reducer;