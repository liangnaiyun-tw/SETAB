import "./PieChart.css";
import { Pie } from "react-chartjs-2";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { useSelector } from "react-redux";
import { interpolateColorByIndex } from "../../utils/interpolateColor";

ChartJS.register(ArcElement, Tooltip, Legend);

function PieChart() {
  const tabs = useSelector(state => state.tab.tabs);

  const totalMemory = tabs.map(tab => tab.privateMemory).reduce((sum, value) => sum + value, 0);
  const backgroundColors = tabs.map((tab, index) => {
    return "rgba(" + interpolateColorByIndex(index, tabs.length).join(", ") + ', 1)';
  });
  const borderColors = tabs.map(tab => {
    return 'rgb(255,255, 255)';
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