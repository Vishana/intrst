import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const FinancialChart = ({ visualization }) => {
  // Add defensive checks
  if (!visualization || !visualization.data || !visualization.data.datasets || !Array.isArray(visualization.data.datasets)) {
    console.log('Invalid visualization data:', visualization);
    return (
      <div className="h-48 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">No chart data available</p>
        </div>
      </div>
    );
  }

  const { type = 'bar', data, options = {} } = visualization;

  // Ensure data structure is valid
  const safeData = {
    labels: data.labels || [],
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      data: dataset.data || []
    }))
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: type === 'pie' || type === 'doughnut' ? 'bottom' : 'top',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
          }
        }
      },
    },
    ...options,
  };

  const renderChart = () => {
    try {
      switch (type) {
        case 'pie':
          return <Pie data={safeData} options={chartOptions} />;
        case 'doughnut':
          return <Doughnut data={safeData} options={chartOptions} />;
        case 'bar':
        default:
          return <Bar data={safeData} options={chartOptions} />;
      }
    } catch (error) {
      console.error('Chart rendering error:', error);
      return (
        <div className="h-48 flex items-center justify-center text-red-500">
          <p>Error rendering chart</p>
        </div>
      );
    }
  };

  return (
    <div className="h-64">
      {renderChart()}
    </div>
  );
};

export default FinancialChart;