import React from 'react';
import { Line } from 'react-chartjs-2';
import { Droplet } from 'lucide-react';
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

export default function HomeScreen() {
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Token Usage',
        data: [20, 45, 28, 80, 99, 43, 50],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y} Tokens`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value: any) {
            return value + ' Tokens';
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="flex items-center mb-6 mt-10">
        <Droplet className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-semibold ml-2 text-gray-800">Smata</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
        <h2 className="text-gray-500 text-lg mb-2">Current Balance</h2>
        <p className="text-4xl font-bold text-gray-800">150 Tokens</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Weekly Usage</h2>
        <div className="w-full h-[300px]">
          <Line data={data} options={options} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-gray-500 text-sm mb-2">Daily Average</h3>
          <p className="text-2xl font-semibold text-gray-800">52 Tokens</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-gray-500 text-sm mb-2">Monthly Usage</h3>
          <p className="text-2xl font-semibold text-gray-800">1,560 Tokens</p>
        </div>
      </div>
    </div>
  );
}