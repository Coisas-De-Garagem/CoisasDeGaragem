import { SellerLayout } from '@/components/seller/SellerLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState, useRef } from 'react';
import { api } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SalesChart } from '@/components/seller/SalesChart';
import type { AnalyticsData, Purchase, Product } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faShoppingBag,
  faChartLine,
  faMoneyBillWave,
  faBoxOpen,
  faQrcode
} from '@fortawesome/free-solid-svg-icons';
import { formatCurrency } from '@/utils/formatters';

export default function SellerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [recentActivity, setRecentActivity] = useState<Array<
    (Purchase & { type: 'sale' }) | (Product & { type: 'product' })
  >>([]);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Helper to get last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const [analyticsRes, purchasesRes, productsRes] = await Promise.all([
          api.getSellerAnalytics({
            period: 'daily',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }),
          api.getPurchases({ limit: 10 }), // Fetch more to build chart
          api.getProducts({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })
        ]);

        if (analyticsRes.success) {
          setAnalyticsData(analyticsRes.data);
        }

        if (purchasesRes.success) {
          setPurchases(purchasesRes.data.purchases);
        }

        // Merge for recent activity
        // Merge for recent activity
        const recentPurchases = (purchasesRes.success && purchasesRes.data?.purchases)
          ? purchasesRes.data.purchases.map(p => ({ ...p, type: 'sale' as const }))
          : [];

        const recentProducts = (productsRes.success && productsRes.data?.products)
          ? productsRes.data.products.map(p => ({ ...p, type: 'product' as const }))
          : [];

        const mergedActivity = [...recentPurchases, ...recentProducts]
          .sort((a, b) => {
            const dateA = new Date(a.type === 'sale' ? a.purchaseDate : a.createdAt).getTime();
            const dateB = new Date(b.type === 'sale' ? b.purchaseDate : b.createdAt).getTime();
            return dateB - dateA;
          })
          .slice(0, 5);

        setRecentActivity(mergedActivity);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Animations
  useGSAP(() => {
    if (!loading && containerRef.current) {
      gsap.from('.dashboard-item', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }
  }, { dependencies: [loading], scope: containerRef });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
      if (diffInHours < 1) return 'Há menos de 1 hora';
      return `Há ${Math.floor(diffInHours)} horas`;
    }
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SellerLayout>
      <div ref={containerRef} className="space-y-8">
        {/* Welcome Section */}
        <div className="dashboard-item bg-gradient-to-r from-[#4169E1] to-[#0047AB] rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full transform -translate-x-1/3 translate-y-1/3 blur-2xl"></div>

          <div className="relative z-10">
            <h1 className="text-3xl lg:text-4xl font-bold mb-3 tracking-tight">
              Olá, {user?.name || 'Vendedor'}! 👋
            </h1>
            <p className="text-blue-100/90 text-lg max-w-2xl">
              Aqui está o panorama da sua garagem hoje. Suas vendas estão indo bem!
            </p>
          </div>
        </div>

        {/* Charts & Metrics */}
        <div className="dashboard-item">
          {analyticsData && (
            <SalesChart
              data={analyticsData}
              purchases={purchases}
              loading={loading}
            />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="dashboard-item lg:col-span-2">
            <Card className="p-6 h-full border border-gray-100 shadow-lg rounded-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FontAwesomeIcon icon={faBoxOpen} className="text-[#4169E1]" />
                Ações Rápidas
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button
                  onClick={() => navigate('/seller/products', { state: { showForm: true } })}
                  className="h-auto py-6 flex flex-col items-center justify-center gap-3 bg-blue-50 text-[#4169E1] hover:bg-[#4169E1] hover:text-white transition-all duration-300 border-none rounded-xl shadow-sm hover:shadow-md group"
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#4169E1] shadow-sm group-hover:scale-110 transition-transform">
                    <FontAwesomeIcon icon={faPlus} className="text-lg" />
                  </div>
                  <span className="font-semibold">Novo Produto</span>
                </Button>

                <Button
                  onClick={() => navigate('/seller/sales')}
                  className="h-auto py-6 flex flex-col items-center justify-center gap-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300 border-none rounded-xl shadow-sm hover:shadow-md group"
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                    <FontAwesomeIcon icon={faShoppingBag} className="text-lg" />
                  </div>
                  <span className="font-semibold">Ver Vendas</span>
                </Button>

                <Button
                  onClick={() => navigate('/seller/analytics')}
                  className="h-auto py-6 flex flex-col items-center justify-center gap-3 bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300 border-none rounded-xl shadow-sm hover:shadow-md group"
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-purple-600 shadow-sm group-hover:scale-110 transition-transform">
                    <FontAwesomeIcon icon={faChartLine} className="text-lg" />
                  </div>
                  <span className="font-semibold">Ver Estatísticas</span>
                </Button>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-item">
            <Card className="p-6 h-full border border-gray-100 shadow-lg rounded-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FontAwesomeIcon icon={faChartLine} className="text-[#4169E1]" />
                Atividade Recente
              </h2>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma atividade recente.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.type === 'sale' ? `sale-${activity.id}` : `prod-${activity.id}`}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
                    >
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                        ${activity.type === 'sale' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}
                      `}>
                        <FontAwesomeIcon icon={activity.type === 'sale' ? faMoneyBillWave : faBoxOpen} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {activity.type === 'sale'
                            ? `Venda de ${formatCurrency(Number(activity.price))}`
                            : `Produto: ${activity.name}`
                          }
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(activity.type === 'sale' ? activity.purchaseDate : activity.createdAt)}
                        </p>
                      </div>

                      {activity.type === 'sale' && activity.qrCodeScanned && (
                        <div className="text-gray-400" title="QR Code Scanned">
                          <FontAwesomeIcon icon={faQrcode} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
