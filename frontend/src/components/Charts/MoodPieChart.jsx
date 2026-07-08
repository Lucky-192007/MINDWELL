import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { scoreToCategory, moodColorHex } from '../../utils/mood';

ChartJS.register(ArcElement, Tooltip, Legend);

const MoodPieChart = ({ distribution }) => {
  // Bucket the raw 1-10 distribution into the 5 named categories
  const buckets = { Great: 0, Good: 0, Okay: 0, Low: 0, Bad: 0 };
  distribution.forEach((d) => {
    const category = scoreToCategory(d._id).label;
    buckets[category] += d.count;
  });

  const labels = Object.keys(buckets).filter((k) => buckets[k] > 0);
  const data = {
    labels,
    datasets: [
      {
        data: labels.map((l) => buckets[l]),
        backgroundColor: labels.map((l) => moodColorHex[l]),
        borderWidth: 0,
      },
    ],
  };

  return (
    <Doughnut
      data={data}
      options={{
        cutout: '70%',
        plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 12 } } } },
      }}
    />
  );
};

export default MoodPieChart;
