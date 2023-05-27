import { createReducer } from "@reduxjs/toolkit";
import { insertTabs, switchGroup } from "../action/tabAction";


const initState = {
  /*These are fake data*/
  currentWorkspaceId: "unsaved",
  currentGroupId: "group-1",
  workspaces: {
    unsaved: {
      groups: {
        "group-1": [
          {
            tabName: "javascript - Where is redux store saved? - Stack Overflow",
            tabURL: "https://stackoverflow.com/questions/38329193/where-is-redux-store-saved",
            privateMemory: 38912000
          }
        ],
      },
    },
    workspace1: {
      groups: {
        "group-2": [
          {
            tabName: "javascript - Where is redux store saved? - Stack Overflow",
            tabURL: "https://stackoverflow.com/questions/38329193/",
            privateMemory: 42736000
          }
        ]
      }
    },
  }
};

const tabReducer = createReducer(initState, (builder) => {
  builder
    .addCase(insertTabs, (state, action) => {
      const { workspaceId, groupId, tabs } = action.payload;

      if (!state.workspaces[workspaceId]) {
        state.workspaces[workspaceId] = {
          groups: {},
        };
      }
      if (!state.workspaces[workspaceId].groups[groupId]) {
        state.workspaces[workspaceId].groups[groupId] = [];
      }

      state.workspaces[workspaceId].groups[groupId].push(...tabs);
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