import { useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import type { AnalyticsData, Purchase } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBox,
  faMoneyBillWave,
  faChartLine,
  faTags,
  faClipboardList,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { formatCurrency } from '@/utils/formatters';

interface SalesChartProps {
  data: AnalyticsData;
  purchases: Purchase[];
  loading?: boolean;
}

export function SalesChart({ data, purchases, loading = false }: SalesChartProps) {
  const chartData = useMemo(() => {
    if (!purchases.length) return [];

    // Group purchases by date
    const groupedData = purchases.reduce((acc, purchase) => {
      const date = new Date(purchase.purchaseDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });

      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += purchase.price;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort (assuming simple date sort or just taking last 7 days)
    // For now, let's map over the last 7 days to ensure a continuous line
    const result = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });
      result.push({
        date: dateStr,
        amount: groupedData[dateStr] || 0,
      });
    }
    return result;
  }, [purchases]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
          <div className="h-80 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Vendas Totais',
      value: data?.totalSales || 0,
      icon: faBox,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Receita Total',
      value: formatCurrency(data?.totalRevenue || 0),
      icon: faMoneyBillWave,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Valor Total Listado',
      value: formatCurrency(data?.totalListingsValue || 0),
      icon: faChartLine,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Produtos Vendidos',
      value: data?.productsSold || 0,
      icon: faTags,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      label: 'Produtos Listados',
      value: data?.productsListed || 0,
      icon: faClipboardList,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Compradores Únicos',
      value: data?.uniqueBuyers || 0,
      icon: faUsers,
      color: 'bg-pink-50 text-pink-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="group hover:-translate-y-1 transition-transform duration-300 bg-white rounded-xl shadow-sm hover:shadow-md p-5 border border-gray-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{metric.label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${metric.color} transition-colors group-hover:scale-110 duration-300`}>
                <FontAwesomeIcon icon={metric.icon} className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Desempenho de Vendas</h3>
            <p className="text-sm text-gray-500">Receita dos últimos 7 dias</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#4169E1]"></span>
            Receita Diária
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4169E1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4169E1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip
                cursor={{ stroke: '#4169E1', strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: any) => [formatCurrency(Number(value)), 'Receita']}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#4169E1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                activeDot={{ r: 6, strokeWidth: 0, fill: '#4169E1' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
