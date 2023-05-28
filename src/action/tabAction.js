import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import { createHash32Str } from "../utils/hash";

/*global chrome*/

const updateTabs = createAction('updateTabs');

const insertTabs = createAction('insertTabs');

const switchGroup = createAction('switchGroup');

let isGetMemoryRunning = false;
async function getMemory(processes, thunkAPI) {
  if (isGetMemoryRunning) return;
  isGetMemoryRunning = true;

  console.log(Date.now());

  const currentState = thunkAPI.getState();

  let tabsInCurrentWindow = await chrome.tabs.query({ currentWindow: true });
  let tabTasks = await Promise.allSettled(Object.values(tabsInCurrentWindow).map(async (tab) => {
    try {
      let pid = await chrome.processes.getProcessIdForTab(tab.id);
      let process = await chrome.processes.getProcessInfo(pid, true);
      process = Object.values(process)[0];
      console.log(tab);
      return {
        tabName: tab.title,
        tabURL: tab.url ? tab.url : tab.pendingUrl,
        tabIconURL: tab.favIconUrl,
        privateMemory: process.privateMemory,
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  }));
  tabTasks = tabTasks.map(tab => tab.value).filter(tab => tab != null);
  console.log(tabTasks);
  tabTasks.sort(function (a, b) {
    return a.privateMemory - b.privateMemory;
  });

  let workspaceId = "unsaved";
  let groupId = currentState.tab.currentGroupId;
  if (groupId === "") {
    groupId = "group-" + createHash32Str();
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


export { updateTabs, insertTabs, switchGroup, fetchTabs };