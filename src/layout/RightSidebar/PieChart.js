import "./PieChart.css";
import { Pie } from "react-chartjs-2";
import { ArcElement, Chart as ChartJS, Legend, Title, Tooltip } from "chart.js";
import { useSelector } from "react-redux";
import { interpolateColorByIndex } from "../../utils/interpolateColor";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

function PieChart() {
  const state = useSelector(state => state.tab);
  const tabs = state.workspaces[state.currentWorkspaceId]?.groups[state.currentGroupId] || [];

  const totalMemory = tabs.map(tab => tab.privateMemory).reduce((sum, value) => sum + value, 0);
  const backgroundColors = tabs.map((tab, index) => {
    return "rgba(" + interpolateColorByIndex(index, tabs.length).join(", ") + ', 1)';
  });
  const borderColors = tabs.map(tab => {
    return 'rgb(255, 255, 255)';
  });


  const data = {
    datasets: [
      {
        label: 'memory usage',
        data: tabs.map((tab) => tab.privateMemory / totalMemory),
        borderWidth: 2,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
      },
    ],
  };

  function clickEvent(event, elements) {
    console.log(elements);
  }

  return (
    <div className="PieChart">
      <Pie
        data={data}
        options={{
          onClick: clickEvent,
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const dataIndex = context.dataIndex;
                  const tab = tabs[dataIndex];
                  const label = tab.tabName;
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
    </div>
  );
}

export { PieChart };