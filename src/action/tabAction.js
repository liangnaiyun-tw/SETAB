import { createAction, createAsyncThunk } from "@reduxjs/toolkit";

/*global chrome*/

const updateTabs = createAction('updateTabs');

function getMemory(processes, thunkAPI) {
  console.log(Date.now());
  let tabTasks = Object.keys(processes).map((id) => {
    if (processes[id].tasks[0].tabId !== undefined
      && ((processes[id].tasks[0].title.startsWith("分頁") || processes[id].tasks[0].title.startsWith("Tab")))) {
      return processes[id];
    } else {
      return undefined;
    }
  }).filter((task) => task !== undefined);

  console.log(tabTasks);

  let newHistory = [];
  tabTasks.forEach((task) => {
    task.tasks.forEach((subTask) => {
      chrome.processes.getProcessIdForTab(subTask.tabId)
        .then((id) => {
          console.log(subTask.tabId);
          console.log(id);
        })
        .catch((err) => {
          console.error(err);
        });
      newHistory.push({
        id: task.id,
        pid: task.osProcessId,
        tabId: subTask.tabId,
        tabName: subTask.title,
        privateMemory: task.privateMemory,
      });
    });
  });
  thunkAPI.dispatch(updateTabs(newHistory));
}

const fetchTabs = createAsyncThunk('fetchTabs', async (id, thunkAPI) => {
  chrome.processes.onUpdatedWithMemory.addListener((processes) => getMemory(processes, thunkAPI));
  return () => {
    chrome.processes.onUpdatedWithMemory.removeListener((processes) => getMemory(processes, thunkAPI));
  }
});


export { updateTabs, fetchTabs };