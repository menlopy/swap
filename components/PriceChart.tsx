import { useEffect, useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  TimeScale,
  Filler,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { usePriceData } from '../hooks/usePriceData';
import { formatAmount } from '../utils/web3';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceChartProps {
  token1Address: string;
  token2Address: string;
  token1Symbol: string;
  token2Symbol: string;
}

type TimeRange = '24H' | '1W' | '1M' | '1Y';
type TimeUnit = 'hour' | 'day' | 'month' | 'year';

const getTimeUnit = (range: TimeRange): TimeUnit => {
  switch (range) {
    case '24H': return 'hour';
    case '1W': return 'day';
    case '1M': return 'month';
    case '1Y': return 'year';
  }
};

const PriceChart = ({ token1Address, token2Address, token1Symbol, token2Symbol }: PriceChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');
  const { historicalPrices, currentPrice, isLoading, error } = usePriceData(token1Address, token2Address);
  
  const chartData: ChartData<'line'> = useMemo(() => {
    if (!historicalPrices.length) {
      return {
        labels: [],
        datasets: [],
      };
    }

    return {
      labels: historicalPrices.map(p => p.timestamp),
      datasets: [
        {
          label: `${token1Symbol}/${token2Symbol}`,
          data: historicalPrices.map(p => p.price),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHitRadius: 10,
          borderWidth: 2,
        },
      ],
    };
  }, [historicalPrices, token1Symbol, token2Symbol]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            const price = context.raw;
            return `1 ${token1Symbol} = ${formatAmount(price, 6)} ${token2Symbol}`;
          },
        },
        padding: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        bodySpacing: 4,
        titleSpacing: 4,
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: getTimeUnit(timeRange),
          displayFormats: {
            hour: 'HH:mm',
            day: 'MMM d',
            month: 'MMM yyyy',
            year: 'yyyy',
          },
        },
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: { size: 12 },
          maxRotation: 0,
        },
      },
      y: {
        position: 'right' as const,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: { size: 12 },
          callback: (value: any) => formatAmount(value, 6),
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  if (isLoading) {
    return (
      <div className="bg-[#1a1a1a] rounded-2xl p-4 h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1a1a1a] rounded-2xl p-4 h-[300px] flex items-center justify-center text-red-500">
        Error loading price data
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-4 h-[300px]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <h3 className="text-white font-medium">
            {token1Symbol}/{token2Symbol} Price
          </h3>
          {currentPrice && (
            <p className="text-sm text-gray-400">
              1 {token1Symbol} = {formatAmount(currentPrice, 6)} {token2Symbol}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {(['24H', '1W', '1M', '1Y'] as TimeRange[]).map((range) => (
            <button
              key={range}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
              }`}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default PriceChart; 