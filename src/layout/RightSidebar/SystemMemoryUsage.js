import './SystemMemoryUsage.css';
import { useDispatch, useSelector } from "react-redux";
import { fetchTabs } from "../../action/tabAction";
import { useEffect } from "react";
import { PieChart } from "./PieChart";
import { Button, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { interpolateColorByIndex } from '../../utils/interpolateColor';
import CircleIcon from '@mui/icons-material/Circle';
import DeleteIcon from '@mui/icons-material/Delete';
import { createHash32Str } from '../../utils/hash';

/*global chrome*/

function SystemMemoryUsage() {
  const dispatch = useDispatch();
  const state = useSelector(state => state.tab);
  const tabs = state.groups[state.currentGroupId]?.tabs || [];

  useEffect(() => {
    const event = dispatch(fetchTabs());
    return () => {
      event();
    }
  }, [dispatch]);

  function clickOnOpenedTab(event, windowIndex) {
    chrome.tabs.highlight({ tabs: windowIndex })
      .catch((err) => {
        console.error(err);
      });
  }

  function closeTab(event, windowIndex) {
    chrome.tabs.query({ currentWindow: true, index: windowIndex })
      .then((tabs) => {
        chrome.tabs.remove(tabs[0].id);
      })
      .catch((err) => {
        console.error(err);
      })
  }

  return (
    <div className="SystemMemoryUsage">
      <div id="system-memeory-usage-title">Current Memory Usage</div>

      <PieChart tabs={tabs}></PieChart>

      <List className="tab-list">
        {tabs.length === 0
          ? <div id="no-tab-message">No Tabs</div>
          : tabs.slice().reverse().map((tab, index) => {
            return (
              <ListItem key={`${tab.tabName}-${createHash32Str()}`} sx={{ columnGap: "3%" }}>
                <CircleIcon sx={{ color: "rgba(" + interpolateColorByIndex(tabs.length - 1 - index, tabs.length).join(", ") + ", 1)" }}></CircleIcon>
                <ListItemButton className="tab-item" onClick={(event) => clickOnOpenedTab(event, tab.windowIndex)}>
                  <div className='tab-item-text'>
                    <Typography variant='body1'>
                      {tab.tabName}
                    </Typography>
                    <div>
                      {`${state.currentWorkspaceId}/${state.currentGroupId}`}
                    </div>
                  </div>
                </ListItemButton>
                <IconButton onClick={(event) => closeTab(event, tab.windowIndex)}>
                  <DeleteIcon></DeleteIcon>
                </IconButton>
              </ListItem>
            );
          })}
      </List>
    </div>
  );
}

export { SystemMemoryUsage };