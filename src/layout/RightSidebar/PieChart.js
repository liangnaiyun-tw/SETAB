import "./PieChart.css";
import { Pie } from "react-chartjs-2";
import { ArcElement, Chart as ChartJS, Legend, Title, Tooltip } from "chart.js";
import { interpolateColorByIndex } from "../../utils/interpolateColor";
import { useState } from "react";
import { GroupModal } from "./GroupModal";
import { getGroupNameChain } from "../../utils/tabs";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

function PieChart(props) {
  const tabs = props.tabs;

  let totalMemory = 0;
  const workspaces = [];
  tabs.forEach((tab) => {
    totalMemory += tab.privateMemory;
    let groupNameChain = getGroupNameChain(tab.group);
    if (!workspaces.find((workspace) => workspace.name === groupNameChain[0])) {
      workspaces.push({
        name: groupNameChain[0],
        tabs: [],
        totalMemory: 0,
        chartLevel: 1,
      });
    }
    workspaces.find((workspace) => workspace.name === groupNameChain[0]).totalMemory += tab.privateMemory;
    workspaces.find((workspace) => workspace.name === groupNameChain[0]).tabs.push(tab);
  });
  workspaces.sort(function (a, b) {
    return a.totalMemory - b.totalMemory;
  });
  console.log("WORKSPACES");
  console.log(workspaces);

  const backgroundColors = [];
  const borderColors = [];
  workspaces.forEach((workspace, index) => {
    backgroundColors.push("rgba(" + interpolateColorByIndex(index, workspaces.length).join(", ") + ', 1)');
    borderColors.push('rgb(255, 255, 255)');
  });

  const data = {
    datasets: [
      {
        data: workspaces.map((workspace) => workspace.totalMemory / totalMemory),
        borderWidth: 2,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
      }
    ]
  };


  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  function modalClickEvent(event, elements) {
    if (elements.length > 0) {
      const dataIndex = elements[0].index;
      const workspace = workspaces[dataIndex];
      setSelectedItem(workspace);
      setModalOpen(true);
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
      ></GroupModal>
    </div>
  );
}

export { PieChart };