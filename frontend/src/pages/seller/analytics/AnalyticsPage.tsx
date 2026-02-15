import { SellerLayout } from '@/components/seller/SellerLayout';
import { SalesChart } from '@/components/seller/SalesChart';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/services/api';
import type { AnalyticsData, Purchase } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faLightbulb,
  faTrophy,
  faCalendarAlt,
  faChartBar,
  faSync
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/common/Button';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [error, setError] = useState('');

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [analyticsRes, purchasesRes] = await Promise.all([
        api.getSellerAnalytics({ period: 'monthly' }),
        api.getPurchases({ limit: 50 })
      ]);

      if (analyticsRes.success) {
        setAnalyticsData(analyticsRes.data);
      } else {
        setError('Erro ao carregar métricas.');
      }

      if (purchasesRes.success) {
        setPurchases(purchasesRes.data.purchases);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Ocorreu um erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  if (loading && !analyticsData) {
    return (
      <SellerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4169E1] mb-4"></div>
          <p className="text-gray-500 font-medium">Analisando seus dados de vendas...</p>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#4169E1] text-xs font-bold uppercase tracking-wider mb-3">
              <FontAwesomeIcon icon={faChartBar} />
              <span>Desempenho da Garagem</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              Estatísticas e Analytics
            </h1>
            <p className="text-lg text-gray-500 mt-2">
              Acompanhe o crescimento do seu negócio e identifique oportunidades.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={fetchAllData}
            isLoading={loading}
            className="rounded-xl"
          >
            <FontAwesomeIcon icon={faSync} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Dados
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3">
            <span className="font-bold">Aviso:</span> {error}
          </div>
        )}

        {/* Sales Chart & Main Metrics */}
        {analyticsData && (
          <SalesChart
            data={analyticsData}
            purchases={purchases}
            loading={loading}
          />
        )}

        {/* Insights & Strategy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 ring-1 ring-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faLightbulb} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Insights Estratégicos
              </h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 hover:bg-blue-50/50 transition-colors border border-transparent hover:border-blue-100">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm">
                  <FontAwesomeIcon icon={faChartLine} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Tendência de Vendas</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {analyticsData?.totalSales && analyticsData.totalSales > 0
                      ? "Suas vendas mostram um padrão positivo de crescimento nesta semana."
                      : "Ainda não há dados suficientes para calcular tendências. Continue listando produtos!"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 hover:bg-emerald-50/50 transition-colors border border-transparent hover:border-emerald-100">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                  <FontAwesomeIcon icon={faTrophy} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Conversão de Clientes</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Você alcançou {analyticsData?.uniqueBuyers || 0} compradores únicos. Cada cliente novo ajuda na reputação da sua garagem.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 hover:bg-purple-50/50 transition-colors border border-transparent hover:border-purple-100">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center text-purple-600 shadow-sm">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Melhor Momento</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Fim de semana costuma ser o pico de buscas por itens de garagem. Considere atualizar seu estoque nas sextas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#4169E1] to-[#0047AB] rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none"></div>

            <h3 className="text-2xl font-bold mb-4 relative z-10">Meta Próxima 🎯</h3>
            <p className="text-blue-100 mb-8 relative z-10">Venda mais para desbloquear novos recursos no seu painel.</p>

            <div className="space-y-6 relative z-10">
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span>Vendas para Vendedor Bronze</span>
                  <span>{analyticsData?.totalSales || 0}/10</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className="bg-white rounded-full h-3 transition-all duration-1000"
                    style={{ width: `${Math.min(((analyticsData?.totalSales || 0) / 10) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <p className="text-sm font-medium">
                  <FontAwesomeIcon icon={faChartLine} className="mr-2 opacity-70" />
                  Dica: Produtos com fotos de alta qualidade vendem até 70% mais rápido na garage sale.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
