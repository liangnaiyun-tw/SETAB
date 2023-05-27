import { createAction, createAsyncThunk } from "@reduxjs/toolkit";

/*global chrome*/

const updateTabs = createAction('updateTabs');

function getMemory(processes, thunkAPI) {
  console.log(Date.now());

  let tabTasks = []

  Object.keys(processes).forEach((id) => {
    processes[id].tasks.forEach((task) => {
      if (task.tabId !== undefined
        && (task.title.startsWith("分頁") || task.title.startsWith("Tab"))) {
        tabTasks.push({
          id: processes[id].id,
          pid: processes[id].osProcessId,
          tabId: task.tabId,
          tabName: task.title.startsWith("分頁：") ? task.title.substring(3) : task.title.substring(5),
          privateMemory: processes[id].privateMemory,
        });
      }
    });
  });

  tabTasks.sort(function (a, b) {
    return a.privateMemory - b.privateMemory;
  });

  console.log(tabTasks);
  thunkAPI.dispatch(updateTabs(tabTasks));
}

const fetchTabs = createAsyncThunk('fetchTabs', async (id, thunkAPI) => {
  chrome.processes.onUpdatedWithMemory.addListener((processes) => getMemory(processes, thunkAPI));
  return () => {
    chrome.processes.onUpdatedWithMemory.removeListener((processes) => getMemory(processes, thunkAPI));
  }
});


export { updateTabs, fetchTabs };