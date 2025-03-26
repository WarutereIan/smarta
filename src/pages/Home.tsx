import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Droplet, Activity } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Home() {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [meterStatus] = useState('active'); // This would come from your backend

  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Usage (Liters)',
        data: [20, 45, 28, 80, 99, 43, 50],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  const monthlyData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Usage (Liters)',
        data: [250, 320, 280, 360],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Droplet className="h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold ml-2">Smata</h1>
        </div>
        <div className="flex items-center gap-2">
          <Activity className={`h-5 w-5 ${meterStatus === 'active' ? 'text-green-500' : 'text-red-500'}`} />
          <span className={`text-sm font-medium ${meterStatus === 'active' ? 'text-green-700' : 'text-red-700'}`}>
            Meter {meterStatus === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-gray-600 text-sm mb-2">Current Balance</h2>
        <p className="text-3xl font-bold text-gray-900">150 Liters</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Water Usage</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1 rounded-md text-sm ${
                timeframe === 'weekly'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1 rounded-md text-sm ${
                timeframe === 'monthly'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
        <Line options={options} data={timeframe === 'weekly' ? weeklyData : monthlyData} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm mb-2">Daily Average</h3>
          <p className="text-xl font-semibold text-gray-900">52 Liters</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm mb-2">Monthly Usage</h3>
          <p className="text-xl font-semibold text-gray-900">1,560 Liters</p>
        </div>
      </div>
    </div>
  );
}