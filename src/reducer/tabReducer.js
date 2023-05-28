import { createReducer } from "@reduxjs/toolkit";
import { insertTabs, switchGroup, updateTabs } from "../action/tabAction";


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
          tabURL: "https://stackoverflow.com/questions/38329193/where-is-redux-store-saved",
          tabIconURL: "https://developer.chrome.com/images/meta/favicon-32x32.png",
          privateMemory: 38912000,
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

const tabReducer = createReducer(initState, (builder) => {
  builder
    .addCase(updateTabs, (state, action) => {
      const { groupId, tabs } = action.payload;
      state.groups[groupId].tabs = tabs;
      return state;
    })
    .addCase(insertTabs, (state, action) => {
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
    })
    .addCase(switchGroup, (state, action) => {
      const { workspaceId, groupId } = action.payload;
      state.currentWorkspaceId = workspaceId;
      state.currentGroupId = groupId;
      return state;
    });
});


export { tabReducer };