import './SystemMemoryUsage.css';
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { PieChart } from "./PieChart";
import { IconButton, Typography } from "@mui/material";
import { interpolateColorByIndex } from '../../utils/interpolateColor';
import CircleIcon from '@mui/icons-material/Circle';
import DeleteIcon from '@mui/icons-material/Delete';
import EnergySavingsLeafOutlinedIcon from '@mui/icons-material/EnergySavingsLeafOutlined';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import { freezeTab, deleteTab, fetchTabs } from '../../features/chromeTabs/chromeTabSlice';
import { getGroupNameChain } from '../../utils/tabs';

/*global chrome*/

function SystemMemoryUsage() {
  const dispatch = useDispatch();
  const tabs = useSelector(state => state.chromeTabs).fetchTabs;

  useEffect(() => {
    const event = dispatch(fetchTabs());
    return () => {
      event();
    }
  }, [dispatch]);

  function clickOnOpenedTab(event, windowId, windowIndex) {
    chrome.windows.update(
      windowId,
      {
        focused: true
      }
    ).catch((err) => {
      console.error(err);
    });
    chrome.tabs.highlight({ windowId: windowId, tabs: windowIndex })
      .catch((err) => {
        console.error(err);
      });
  }

  async function clickFreezeTab(event, currentTab) {
    await chrome.tabs.discard(currentTab.tabId)
      .then((tab) => {
        dispatch(freezeTab(currentTab));
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async function clickCloseTab(event, currentTab) {
    await chrome.tabs.remove(currentTab.tabId)
      .then(() => {
        dispatch(deleteTab(currentTab));
      })
      .catch((err) => {
        console.error(err);
      });
  }

  return (
    <div className="SystemMemoryUsage">
      <div id="system-memeory-usage-title">Current Memory Usage</div>

      <PieChart></PieChart>

      <ul className="tab-list">
        {tabs.length === 0
          ? <div id="no-tab-message">Loading...</div>
          : tabs.filter(tab => tab.status !== "unloaded").reverse().map((tab, index) => {
            return (
              <li key={`${tab.title}-${tab.windowId}-${tab.tabId}`} className='tab-list-item'>
                <div className='tab-list-content' onClick={(event) => clickOnOpenedTab(event, tab.windowId, tab.windowIndex)}>
                  <CircleIcon sx={{ color: "rgba(" + interpolateColorByIndex(tabs.length - 1 - index, tabs.length).join(", ") + ", 1)" }}></CircleIcon>
                  <div className='tab-list-content-text'>
                    <Typography variant='body1' noWrap={true}>{tab.alias}</Typography>
                    <Typography variant="body2" noWrap={true}>
                      {getGroupNameChain(tab.group).join(" / ")}
                    </Typography>
                  </div>
                </div>

                <div className='tab-list-freeze-button-container'>
                  <IconButton onClick={(event) => clickFreezeTab(event, tab)}>
                    <PauseOutlinedIcon></PauseOutlinedIcon>
                  </IconButton>
                </div>

                <div className='tab-list-delete-button-container'>
                  <IconButton onClick={(event) => clickCloseTab(event, tab)}>
                    <DeleteIcon></DeleteIcon>
                  </IconButton>
                </div>
              </li>
            );
          })}
        {tabs.find(tab => tab.status === "unloaded") === undefined
          ? <></>
          : tabs.filter(tab => tab.status === "unloaded").map((tab) => {
            return (
              <li key={`${tab.title}-${tab.windowId}-${tab.tabId}`} className='tab-list-item'>
                <div className='tab-list-content-unload' onClick={(event) => clickOnOpenedTab(event, tab.windowId, tab.windowIndex)}>
                  <EnergySavingsLeafOutlinedIcon sx={{ color: "#53af2e" }}></EnergySavingsLeafOutlinedIcon>
                  <div className='tab-list-content-text'>
                    <Typography variant='body1' noWrap={true}>{tab.alias}</Typography>
                    <Typography variant='body2' noWrap={true}>
                      {getGroupNameChain(tab.group).join(" / ")}
                    </Typography>
                  </div>
                </div>

                <div className='tab-list-freeze-button-container'>
                  <IconButton onClick={(event) => clickFreezeTab(event, tab)}>
                    <PauseOutlinedIcon></PauseOutlinedIcon>
                  </IconButton>
                </div>

                <div className='tab-list-delete-button-container'>
                  <IconButton onClick={(event) => clickCloseTab(event, tab)}>
                    <DeleteIcon></DeleteIcon>
                  </IconButton>
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

export { SystemMemoryUsage };