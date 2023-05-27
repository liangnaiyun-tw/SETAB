import { Pie } from "react-chartjs-2";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { useSelector } from "react-redux";

ChartJS.register(ArcElement, Tooltip, Legend);

function PieChart() {
  const tabs = useSelector(state => state.tab.tabs);

  const totalMemory = tabs.map(tab => tab.privateMemory).reduce((sum, value) => sum + value, 0);
  const data = {
    datasets: [
      {
        label: 'memory usage',
        data: tabs.map((tab) => tab.privateMemory / totalMemory),
        borderWidth: 2,
      },
    ],
  };

  function clickEvent(event, elements) {
    console.log(elements);
  }

  return (
    <div className="PieChart">
      <Pie data={data} options={{ onClick: clickEvent }}></Pie>
    </div>
  );
}

export { PieChart };