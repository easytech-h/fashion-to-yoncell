import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface Sale {
  date: string;
  total: number;
}

interface DailySalesChartProps {
  sales: Sale[];
  days?: number;
}

const DailySalesChart: React.FC<DailySalesChartProps> = ({ sales, days = 7 }) => {
  // Generate date range for last N days
  const dateRange = eachDayOfInterval({
    start: subDays(new Date(), days - 1),
    end: new Date()
  });

  // Aggregate sales by date
  const dailySales = dateRange.map(date => {
    const dayTotal = sales
      .filter(sale => {
        const saleDate = new Date(sale.date);
        return (
          saleDate.getDate() === date.getDate() &&
          saleDate.getMonth() === date.getMonth() &&
          saleDate.getFullYear() === date.getFullYear()
        );
      })
      .reduce((sum, sale) => sum + sale.total, 0);

    return {
      date,
      total: dayTotal
    };
  });

  const data = {
    labels: dailySales.map(sale => format(sale.date, 'dd MMM', { locale: fr })),
    datasets: [
      {
        label: 'Ventes Journalières (HTG)',
        data: dailySales.map(sale => sale.total),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgb(59, 130, 246)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Évolution des Ventes',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => `HTG ${context.parsed.y.toLocaleString('fr-FR')}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 11
          },
          callback: (value: number) => `HTG ${value.toLocaleString('fr-FR')}`
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default DailySalesChart;