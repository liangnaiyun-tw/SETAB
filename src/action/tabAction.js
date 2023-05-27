import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import { createHash256Str } from "../utils/hash";

/*global chrome*/

const insertTabs = createAction('insertTabs');

const switchGroup = createAction('switchGroup');

async function getMemory(processes, thunkAPI) {
  console.log(Date.now());

  let tabTasks = [];
  for (let id of Object.keys(processes)) {
    for (let task of processes[id].tasks) {
      if (
        task.tabId !== undefined &&
        (task.title.startsWith("分頁") || task.title.startsWith("Tab"))) {

        let tabTask = {
          tabName: task.title.startsWith("分頁：")
            ? task.title.substring(3)
            : task.title.substring(5),
          privateMemory: processes[id].privateMemory,
        };

        try {
          const tab = await chrome.tabs.get(task.tabId);
          tabTask.tabURL = tab.url !== undefined ? tab.url : tab.pendingUrl;
        } catch (err) {
          console.error(err);
        }
        tabTasks.push(tabTask);
      }
    }
  }

  tabTasks.sort(function (a, b) {
    return a.privateMemory - b.privateMemory;
  });

  let workspaceId = "unsaved";
  let groupId = "group-" + createHash256Str();
  console.log(tabTasks);
  thunkAPI.dispatch(insertTabs({
    workspaceId,
    groupId,
    tabs: tabTasks
  }));
  thunkAPI.dispatch(switchGroup({
    workspaceId,
    groupId
  }));
}

const fetchTabs = createAsyncThunk('fetchTabs', async (id, thunkAPI) => {
  chrome.processes.onUpdatedWithMemory.addListener((processes) => { getMemory(processes, thunkAPI) });
  return () => {
    chrome.processes.onUpdatedWithMemory.removeListener((processes) => getMemory(processes, thunkAPI));
  }
});


export { insertTabs, switchGroup, fetchTabs };