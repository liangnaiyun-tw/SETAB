import './SystemMemoryUsage.css';
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { PieChart } from "./PieChart";
import { IconButton, Typography, Divider } from "@mui/material";
import { interpolateColorByIndex } from '../../utils/interpolateColor';
import CircleIcon from '@mui/icons-material/Circle';
import DeleteIcon from '@mui/icons-material/Delete';
import EnergySavingsLeafOutlinedIcon from '@mui/icons-material/EnergySavingsLeafOutlined';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import { fetchTabs, freezeChromeTab, closeChromeTab, reloadChromeTab } from '../../features/chromeTabs/chromeTabSlice';
import { getGroupNameChain } from '../../utils/tabs';


function SystemMemoryUsage() {
  const dispatch = useDispatch();
  const tabs = useSelector(state => state.chromeTabs).fetchTabs;

  useEffect(() => {
    const event = dispatch(fetchTabs());
    return event;
  }, [dispatch]);

  function clickOnOpenedTab(event, currentTab) {
    dispatch(reloadChromeTab(currentTab));
  }

  function clickFreezeTab(event, currentTab) {
    event.stopPropagation();
    dispatch(freezeChromeTab(currentTab));
  }

  function clickCloseTab(event, currentTab) {
    event.stopPropagation();
    dispatch(closeChromeTab(currentTab));
  }

  return (
    <div className="SystemMemoryUsage">
      <div id="system-memeory-usage-title" style={{ font: 'inherit', fontSize: '24px' }}>Current Memory Usage</div>

      <PieChart></PieChart>
      <Divider style={{ marginBottom: 16 }} />
      <ul className="tab-list">
        {tabs.length === 0
          ? <div id="no-tab-message">Loading...</div>
          : tabs.filter(tab => tab.status !== "unloaded").reverse().map((tab, index) => {
            return (
              <li key={`${tab.title}-${tab.windowId}-${tab.tabId}`} className='tab-list-item'>
                <div className='tab-list-content' onClick={(event) => clickOnOpenedTab(event, tab)}>
                  <CircleIcon sx={{ color: "rgba(" + interpolateColorByIndex(tabs.length - 1 - index, tabs.length).join(", ") + ", 1)" }}></CircleIcon>
                  <div className='tab-list-content-text'>
                    <Typography variant='body1' noWrap={true}>{tab.alias}</Typography>
                    <Typography variant="body2" noWrap={true}>
                      {getGroupNameChain(tab.group).join(" / ")}
                    </Typography>
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
                </div>
              </li>
            );
          })}
        {tabs.find(tab => tab.status === "unloaded") === undefined
          ? <></>
          : tabs.filter(tab => tab.status === "unloaded").map((tab) => {
            return (
              <li key={`${tab.title}-${tab.windowId}-${tab.tabId}`} className='tab-list-item'>
                <div className='tab-list-content-unload' onClick={(event) => clickOnOpenedTab(event, tab)}>
                  <EnergySavingsLeafOutlinedIcon sx={{ color: "#53af2e" }}></EnergySavingsLeafOutlinedIcon>
                  <div className='tab-list-content-text'>
                    <Typography variant='body1' noWrap={true}>{tab.alias}</Typography>
                    <Typography variant='body2' noWrap={true}>
                      {getGroupNameChain(tab.group).join(" / ")}
                    </Typography>
                  </div>

                  <div className='tab-list-freeze-button-container'>
                    <IconButton onClick={(event) => clickFreezeTab(event, tab)}>
                      <PauseOutlinedIcon color="action"></PauseOutlinedIcon>
                    </IconButton>
                  </div>

                  <div className='tab-list-delete-button-container'>
                    <IconButton onClick={(event) => clickCloseTab(event, tab)}>
                      <DeleteIcon color="error"></DeleteIcon>
                    </IconButton>
                  </div>
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

export { SystemMemoryUsage };