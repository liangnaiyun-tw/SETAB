import { useDispatch, useSelector } from "react-redux";
import { fetchTabs } from "../../action/tabAction";
import { useEffect } from "react";
import { PieChart } from "./PieChart";


function SystemMemoryUsage() {
  const dispatch = useDispatch();
  const tabs = useSelector(state => state.tab.tabs);

  useEffect(() => {
    const event = dispatch(fetchTabs());
    return () => {
      event();
    }
  }, [dispatch]);

  return (
    <div className="SystemMemoryUsage">
      <PieChart></PieChart>
      {tabs.map((task) => {
        return (
          <div key={task.tabId} className="tabTask">
            <ul>
              <li>Id: {task.id}</li>
              <li>Pid: {task.pid}</li>
              <li>Tab Id: {task.tabId}</li>
              <li>Tab Name: {task.tabName}</li>
              <li>Private Memory: {task.privateMemory}</li>
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export { SystemMemoryUsage };