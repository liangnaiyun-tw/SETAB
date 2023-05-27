import { Pie } from "react-chartjs-2";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { useSelector } from "react-redux";

ChartJS.register(ArcElement, Tooltip, Legend);


function interpolateColor(index, totalLength) {
  let g;
  let r;
  let b = 70;

  if (index < totalLength / 2) {
    g = 255;
    r = Math.round((index / (totalLength / 2 - 1)) * 255);
  } else {
    g = Math.round(((totalLength - 1 - index) / (totalLength / 2 - 1)) * 255);
    r = 255;
  }

  let color = "rgba(" + r + ", " + g + ", " + b + ", ";
  return color;
}

function PieChart() {
  const tabs = useSelector(state => state.tab.tabs);

  const totalMemory = tabs.map(tab => tab.privateMemory).reduce((sum, value) => sum + value, 0);

  const backgroundColors = tabs.map((tab, index) => {
    return interpolateColor(index, tabs.length) + '1)';
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