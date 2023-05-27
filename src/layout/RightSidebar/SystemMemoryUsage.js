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
  const tabs = state.workspaces[state.currentWorkspaceId].groups[state.currentGroupId];

  useEffect(() => {
    const event = dispatch(fetchTabs());
    return () => {
      event();
    }
  }, [dispatch]);

  return (
    <div className="SystemMemoryUsage">
      <PieChart></PieChart>

      <List className="tab-list">
        {tabs.slice().reverse().map((tab, index) => {
          return (
            <ListItemButton className="tab-item" key={tab.tabName}>
              <ListItemIcon className="tab-item-button">
                <CircleIcon sx={{ color: "rgba(" + interpolateColorByIndex(tabs.length - 1 - index, tabs.length).join(", ") + ", 1)" }}></CircleIcon>
              </ListItemIcon>
              <ListItemText primary={tab.tabName} className="tab-text"></ListItemText>
            </ListItemButton>
          );
        })}
      </List>
    </div>
  );
}

export { SystemMemoryUsage };