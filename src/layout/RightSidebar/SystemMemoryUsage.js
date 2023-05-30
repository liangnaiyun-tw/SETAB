import './SystemMemoryUsage.css';
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { PieChart } from "./PieChart";
import { IconButton, List, ListItem, ListItemButton, Typography } from "@mui/material";
import { interpolateColorByIndex } from '../../utils/interpolateColor';
import CircleIcon from '@mui/icons-material/Circle';
import DeleteIcon from '@mui/icons-material/Delete';
import { createRandomUUID } from '../../utils/hash';
import { fetchTabs } from '../../features/chromeTabs/chromeTabSlice';
import { getFullGroupNameById } from '../../utils/tabs';

/*global chrome*/

function SystemMemoryUsage() {
  const dispatch = useDispatch();
  const state = useSelector(state => state.chromeTabs);
  const tabs = state.fetchTabs;

  useEffect(() => {
    const event = dispatch(fetchTabs());
    return () => {
      event();
    }
  }, [dispatch]);

  function clickOnOpenedTab(event, windowId, windowIndex) {
    chrome.tabs.highlight({ windowId: windowId, tabs: windowIndex })
      .catch((err) => {
        console.error(err);
      });
  }

  function closeTab(event, tabId) {
    chrome.tabs.remove(tabId)
      .catch((err) => {
        console.error(err);
      });
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
              <ListItem key={`${tab.title}-${createRandomUUID()}`} sx={{ columnGap: "3%" }}>
                <CircleIcon sx={{ color: "rgba(" + interpolateColorByIndex(tabs.length - 1 - index, tabs.length).join(", ") + ", 1)" }}></CircleIcon>
                <ListItemButton className="tab-item" onClick={(event) => clickOnOpenedTab(event, tab.windowId, tab.windowIndex)}>
                  <div className='tab-item-text'>
                    <Typography variant='body1'>
                      {tab.title}
                    </Typography>
                    <div>
                      {getFullGroupNameById(tab.group)}
                    </div>
                  </div>
                </ListItemButton>
                <IconButton onClick={(event) => closeTab(event, tab.tabId)}>
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