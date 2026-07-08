import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const MoodLineChart = ({ entries }) => {
  const data = {
    labels: entries.map((e) => new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Mood',
        data: entries.map((e) => e.mood),
        borderColor: '#7C9885',
        backgroundColor: 'rgba(124, 152, 133, 0.15)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Energy',
        data: entries.map((e) => e.energy),
        borderColor: '#A9A1C9',
        backgroundColor: 'rgba(169, 161, 201, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: { min: 0, max: 10, ticks: { stepSize: 2 } },
    },
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  return <Line data={data} options={options} />;
};

export default MoodLineChart;
