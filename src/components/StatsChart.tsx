import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { StatsData } from '../types';

Chart.register(...registerables);

interface StatsChartProps {
  stats: StatsData;
}

export const StatsChart = ({ stats }: StatsChartProps) => {
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const pieChartInstance = useRef<Chart | null>(null);
  const barChartInstance = useRef<Chart | null>(null);
  const lineChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (pieChartRef.current && stats.actionStats.length > 0) {
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }
      
      pieChartInstance.current = new Chart(pieChartRef.current, {
        type: 'pie',
        data: {
          labels: stats.actionStats.map((s) => getActionLabel(s.type)),
          datasets: [
            {
              data: stats.actionStats.map((s) => s.count),
              backgroundColor: [
                '#3B82F6',
                '#10B981',
                '#F59E0B',
                '#EF4444',
                '#8B5CF6',
                '#EC4899',
              ],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
            },
            title: {
              display: true,
              text: '动作类型分布',
            },
          },
        },
      });
    }

    if (barChartRef.current && stats.actionStats.length > 0) {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }
      
      barChartInstance.current = new Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels: stats.actionStats.map((s) => getActionLabel(s.type)),
          datasets: [
            {
              label: '成功率 (%)',
              data: stats.actionStats.map((s) => s.successRate),
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: '各动作成功率',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
            },
          },
        },
      });
    }

    if (lineChartRef.current && stats.trendData.length > 0) {
      if (lineChartInstance.current) {
        lineChartInstance.current.destroy();
      }
      
      lineChartInstance.current = new Chart(lineChartRef.current, {
        type: 'line',
        data: {
          labels: stats.trendData.map((d) => d.date),
          datasets: [
            {
              label: '评分趋势',
              data: stats.trendData.map((d) => d.score),
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: '训练评分趋势',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
            },
          },
        },
      });
    }

    return () => {
      if (pieChartInstance.current) pieChartInstance.current.destroy();
      if (barChartInstance.current) barChartInstance.current.destroy();
      if (lineChartInstance.current) lineChartInstance.current.destroy();
    };
  }, [stats]);

  const getActionLabel = (type: string) => {
    const labels: Record<string, string> = {
      serve: '发球',
      forehand: '正手',
      backhand: '反手',
      smash: '扣杀',
      drop: '放网',
      net: '网前',
    };
    return labels[type] || type;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <canvas ref={pieChartRef} />
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        <canvas ref={barChartRef} />
      </div>
      <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
        <canvas ref={lineChartRef} />
      </div>
    </div>
  );
};
