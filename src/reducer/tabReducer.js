import { createReducer } from "@reduxjs/toolkit";
import { insertTabs, switchGroup, updateTabs } from "../action/tabAction";


const initState = {
  /*These are fake data*/
  currentWorkspaceId: "unsaved",
  currentGroupId: "",
  workspaces: {
    unsaved: {
      groups: {
        "group-1": {
          tabs: [
            {
              tabName: "javascript - Where is redux store saved? - Stack Overflow",
              tabURL: "https://stackoverflow.com/questions/38329193/where-is-redux-store-saved",
              privateMemory: 38912000
            }
          ]
        }
      },
    },
    workspace1: {
      groups: {
        "group-2": {
          tabs: [
            {
              tabName: "javascript - Where is redux store saved? - Stack Overflow",
              tabURL: "https://stackoverflow.com/questions/38329193/",
              privateMemory: 42736000
            }
          ]
        }
      }
    },
    workspace2: {
      groups: {
        "parent-group": {
          groups: {
            "child-group": {
              tabs: [],
            }
          }
        }
      }
    }
  }
};

const tabReducer = createReducer(initState, (builder) => {
  builder
    .addCase(updateTabs, (state, action) => {
      const { workspaceId, groupId, tabs } = action.payload;
      state.workspaces[workspaceId].groups[groupId].tabs = [
        ...tabs
      ];
      return state;
    })
    .addCase(insertTabs, (state, action) => {
      const { workspaceId, groupId, tabs } = action.payload;

      if (!state.workspaces[workspaceId]) {
        state.workspaces[workspaceId] = {
          groups: {},
        };
      }
      if (!state.workspaces[workspaceId].groups[groupId]) {
        state.workspaces[workspaceId].groups[groupId] = {
          tabs: [],
        };
      }

      state.workspaces[workspaceId].groups[groupId].tabs.push(...tabs);
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