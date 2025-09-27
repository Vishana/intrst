import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const FinancialChart = ({ data, timeRange, showAmounts }) => {
  if (!data) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-500">No chart data available</p>
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            if (!showAmounts) {
              return `${context.dataset.label}: ****`;
            }
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value) {
            if (!showAmounts) return '****';
            return '$' + value.toLocaleString();
          }
        }
      },
    },
  };

  // Sample chart data - in a real app this would come from your API
  const chartData = {
    labels: data?.labels || generateLabels(timeRange),
    datasets: [
      {
        label: 'Income',
        data: data?.income || generateSampleData(timeRange, 'income'),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: data?.expenses || generateSampleData(timeRange, 'expenses'),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Net Savings',
        data: data?.savings || generateSampleData(timeRange, 'savings'),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="h-80">
      <Line options={chartOptions} data={chartData} />
    </div>
  );
};

// Helper functions to generate sample data
const generateLabels = (timeRange) => {
  const now = new Date();
  const labels = [];
  
  let days;
  switch (timeRange) {
    case '7d':
      days = 7;
      break;
    case '30d':
      days = 30;
      break;
    case '90d':
      days = 90;
      break;
    case '1y':
      days = 365;
      break;
    default:
      days = 30;
  }

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    if (timeRange === '1y' && i % 30 !== 0) continue; // Monthly labels for yearly view
    if (timeRange === '90d' && i % 7 !== 0) continue; // Weekly labels for quarterly view
    
    labels.push(date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }));
  }
  
  return labels;
};

const generateSampleData = (timeRange, type) => {
  const baseValues = {
    income: 4500,
    expenses: 3200,
    savings: 1300
  };
  
  let dataPoints;
  switch (timeRange) {
    case '7d':
      dataPoints = 8;
      break;
    case '30d':
      dataPoints = 31;
      break;
    case '90d':
      dataPoints = 13; // Weekly data points
      break;
    case '1y':
      dataPoints = 13; // Monthly data points
      break;
    default:
      dataPoints = 31;
  }

  const data = [];
  const base = baseValues[type];
  
  for (let i = 0; i < dataPoints; i++) {
    // Add some realistic variation
    const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
    const seasonalFactor = 1 + Math.sin(i / dataPoints * Math.PI * 2) * 0.1; // Seasonal variation
    const value = Math.max(0, base * (1 + variation) * seasonalFactor);
    
    data.push(Math.round(value));
  }
  
  return data;
};

export default FinancialChart;
