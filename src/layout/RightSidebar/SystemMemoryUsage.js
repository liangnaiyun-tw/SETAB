import { useEffect, useState } from "react";

/*global chrome*/

function SystemMemoryUsage() {
  const [history, setHistory] = useState([]);

  function getMemory(processes) {
    console.log(Date.now());
    let tabTasks = Object.keys(processes).map((id) => {
      if (processes[id].tasks[0].tabId !== undefined) {
        return processes[id];
      } else {
        return undefined;
      }
    }).filter((task) => task !== undefined);

    console.log(tabTasks);

    let newHistory = [];
    tabTasks.forEach((task) => {
      task.tasks.forEach((subTask) => {
        chrome.processes.getProcessIdForTab(subTask.tabId)
          .then((id) => {
            console.log(subTask.tabId);
            console.log(id);
          });
        newHistory.push({
          id: task.id,
          parentPid: task.osProcessId,
          pid: task.osProcessId,
          tabId: subTask.tabId,
          tabName: subTask.title,
          jsMemoryAllocated: task.jsMemoryAllocated,
          jsMemoryUsed: task.jsMemoryUsed,
          privateMemory: task.privateMemory,
        });
      });
    });
    setHistory(newHistory);
  }

  // useEffect(() => {
  //   chrome.processes.onUpdatedWithMemory.addListener(getMemory);
  //   return () => {
  //     chrome.processes.onUpdatedWithMemory.removeListener(getMemory);
  //   };
  // }, []);

  return (
    <div className="SystemMemoryUsage">
      {history.map((task) => {
        return (
          <div key={task.tabId} className="tabTask">
            <ul>
              <li>Id: {task.id}</li>
              <li>Pid: {task.pid}</li>
              <li>Tab Id: {task.tabId}</li>
              <li>Tab Name: {task.tabName}</li>
              <li>Javascript Memory Allocated: {task.jsMemoryAllocated}</li>
              <li>Javascript Memory Used: {task.jsMemoryUsed}</li>
              <li>Private Memory: {task.privateMemory}</li>
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export { SystemMemoryUsage };