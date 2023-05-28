import './SystemMemoryUsage.css';
import { useDispatch, useSelector } from "react-redux";
import { fetchTabs } from "../../action/tabAction";
import { useEffect } from "react";
import { PieChart } from "./PieChart";
import { List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { interpolateColorByIndex } from '../../utils/interpolateColor';
import CircleIcon from '@mui/icons-material/Circle';


function SystemMemoryUsage() {
  const dispatch = useDispatch();
  const state = useSelector(state => state.tab);
  const tabs = state.groups[state.currentGroupId]?.tabs || [];

  useEffect(() => {
    const event = dispatch(fetchTabs());
    return () => {
      event();
    }
  }, []);

  return (
    <div className="SystemMemoryUsage">
      <div id="system-memeory-usage-title">Current Memory Usage</div>

      <PieChart tabs={tabs}></PieChart>

      <List className="tab-list">
        {tabs.length === 0
          ? <div>No Tabs Yet</div>
          : tabs.slice().reverse().map((tab, index) => {
            return (
              <ListItemButton className="tab-item" key={tab.tabName}>
                <ListItemIcon className="tab-item-button">
                  <CircleIcon sx={{ color: "rgba(" + interpolateColorByIndex(tabs.length - 1 - index, tabs.length).join(", ") + ", 1)" }}></CircleIcon>
                </ListItemIcon>
                <div className='tab-item-text'>
                  <ListItemText
                    primary={tab.tabName}
                    primaryTypographyProps={{
                      style: { whiteSpace: "normal" }
                    }}
                    className="tab-text">
                  </ListItemText>
                  {`${state.currentWorkspaceId}/${state.currentGroupId}`}
                </div>
              </ListItemButton>
            );
          })}
      </List>
    </div>
  );
}

export { SystemMemoryUsage };