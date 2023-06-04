import "./PieChart.css";
import { useSelector } from "react-redux";
import { Pie } from "react-chartjs-2";
import { ArcElement, Chart as ChartJS, Legend, Title, Tooltip } from "chart.js";
import { interpolateColorByIndex } from "../../utils/interpolateColor";
import { useState, useEffect } from "react";
import { GroupModal } from "./GroupModal";
import { getGroupIdChain, getGroupNameChain } from "../../utils/tabs";

/*globa chrome*/


ChartJS.register(ArcElement, Tooltip, Legend, Title);

function PieChart() {
  const state = useSelector((state) => state.chromeTabs);

  const [workspaces, setWorkspaces] = useState([]);
  const [backgroundColors, setBackgroundColors] = useState([]);
  const [borderColors, setBorderColors] = useState([]);

  useEffect(() => {
    const newWorkspaces = [];
    state.fetchTabs.forEach((tab) => {
      let groupIdChain = getGroupIdChain(tab.group);
      let groupNameChain = getGroupNameChain(tab.group);
      if (!newWorkspaces.find((workspace) => workspace.id === groupIdChain[0])) {
        newWorkspaces.push({
          id: groupIdChain[0],
          name: groupNameChain[0],
          tabs: [],
          totalMemory: 0,
        });
      }
      newWorkspaces.find((workspace) => workspace.id === groupIdChain[0]).totalMemory += tab.privateMemory;
      newWorkspaces.find((workspace) => workspace.id === groupIdChain[0]).tabs.push(tab);
    });
    newWorkspaces.sort(function (a, b) {
      return a.totalMemory - b.totalMemory;
    });

    const newBackgroundColors = newWorkspaces.map((workspace, index) => {
      return "rgba(" + interpolateColorByIndex(index, newWorkspaces.length).join(", ") + ", 1)";
    });
    const newBorderColors = newWorkspaces.map(() => {
      return "rgb(255, 255, 255)";
    });

    setWorkspaces(newWorkspaces);
    setBackgroundColors(newBackgroundColors);
    setBorderColors(newBorderColors);
  }, [state.fetchTabs]);

  const totalMemory = workspaces.reduce((sum, workspace) => sum + workspace.totalMemory, 0);

  const data = {
    datasets: [
      {
        data: workspaces.map((workspace) => workspace.totalMemory / totalMemory),
        borderWidth: 2,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
      },
    ],
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemHistory, setSelectedItemHistory] = useState([]);
  const [chartLevel, setChartLevel] = useState(1);

  function modalClickEvent(event, elements) {
    if (elements.length > 0) {
      const workspace = workspaces[elements[0].index];
      let newHistory = [...selectedItemHistory];
      if (selectedItemHistory.length === 0) {
        newHistory.push(workspace.id);
      } else {
        newHistory[0] = workspace.id;
      }

      setSelectedItem(workspace.id);
      setSelectedItemHistory(newHistory);
      setModalOpen(true);
      setChartLevel(1);
    }
  }


  return (
    <div className="PieChart">
      <Pie
        data={data}
        options={{
          onClick: modalClickEvent,
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const dataIndex = context.dataIndex;
                  const workspace = workspaces[dataIndex];
                  const label = workspace.name;
                  const value = (context.formattedValue * 100).toFixed(1);

                  const maxLabelLength = 15;
                  if (label.length > maxLabelLength) {
                    const words = label.split("");
                    let line = "";
                    const wrappedLabel = words.reduce((result, letter) => {
                      if (line.length + 1 <= maxLabelLength) {
                        line += letter;
                      } else {
                        result.push(line);
                        line = letter;
                      }
                      return result;
                    }, []);
                    wrappedLabel.push(line + `: ${value}%`);
                    return wrappedLabel;
                  }
                  return `${label}: ${value}%`;
                },
              },
            },
          },
        }}
      />

      <GroupModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        selectedItemHistory={selectedItemHistory}
        setSelectedItemHistory={setSelectedItemHistory}
        chartLevel={chartLevel}
        setChartLevel={setChartLevel}
      ></GroupModal>
    </div>
  );
}

export { PieChart };