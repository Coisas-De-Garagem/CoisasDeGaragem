import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faBagShopping,
  faChartLine,
  faMoneyBillWave,
  faBoxOpen,
  faQrcode,
} from '@fortawesome/free-solid-svg-icons';
import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';
import { SalesChart } from '@/components/seller/SalesChart';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';
import type { AnalyticsData, Purchase, Product } from '@/types';
import { formatCurrency } from '@/utils/formatters';

type Activity = (Purchase & { type: 'sale' }) | (Product & { type: 'product' });

export default function SellerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const [analyticsRes, purchasesRes, productsRes] = await Promise.all([
          api.getSellerAnalytics({
            period: 'daily',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }),
          api.getPurchases({ limit: 10 }),
          api.getMyProducts({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        ]);

        if (analyticsRes.success) setAnalyticsData(analyticsRes.data);
        if (purchasesRes.success) setPurchases(purchasesRes.data.purchases);

        const recentPurchases =
          purchasesRes.success && purchasesRes.data?.purchases
            ? purchasesRes.data.purchases.map((p) => ({ ...p, type: 'sale' as const }))
            : [];
        const recentProducts =
          productsRes.success && productsRes.data?.products
            ? productsRes.data.products.map((p) => ({ ...p, type: 'product' as const }))
            : [];

        const merged = [...recentPurchases, ...recentProducts]
          .sort((a, b) => {
            const dateA = new Date(a.type === 'sale' ? a.purchaseDate : a.createdAt).getTime();
            const dateB = new Date(b.type === 'sale' ? b.purchaseDate : b.createdAt).getTime();
            return dateB - dateA;
          })
          .slice(0, 5);

        setRecentActivity(merged);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useGSAP(
    () => {
      if (!loading && containerRef.current) {
        gsap.from('.dashboard-item', {
          y: 16,
          opacity: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: 'power3.out',
        });
      }
    },
    { dependencies: [loading], scope: containerRef },
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
    if (diffInHours < 24) {
      if (diffInHours < 1) return 'Há menos de 1 hora';
      return `Há ${Math.floor(diffInHours)} horas`;
    }
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const quickActions = [
    {
      label: 'Novo produto',
      icon: faPlus,
      onClick: () => navigate('/seller/products', { state: { showForm: true } }),
    },
    {
      label: 'Ver vendas',
      icon: faBagShopping,
      onClick: () => navigate('/seller/sales'),
    },
    {
      label: 'Estatísticas',
      icon: faChartLine,
      onClick: () => navigate('/seller/analytics'),
    },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Cabeçalho */}
      <div className="dashboard-item">
        <h1 className="text-2xl font-semibold text-text-main">
          Olá, {user?.name?.split(' ')[0] || 'Vendedor'}
        </h1>
        <p className="text-text-muted mt-1">Aqui está o panorama da sua garagem hoje.</p>
      </div>

      {/* Métricas / gráfico */}
      <div className="dashboard-item">
        <SalesChart
          data={analyticsData ?? undefined}
          purchases={purchases}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ações rápidas */}
        <Card className="dashboard-item lg:col-span-2">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-medium text-text-main">Ações rápidas</h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className="flex items-center gap-3 p-4 rounded-lg border border-border bg-background hover:bg-surface-hover transition-colors text-left"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 text-primary [&_svg]:w-4 [&_svg]:h-4">
                  <FontAwesomeIcon icon={action.icon} />
                </span>
                <span className="text-sm font-medium text-text-main">{action.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Atividade recente */}
        <Card className="dashboard-item">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-medium text-text-main">Atividade recente</h2>
          </div>

          {loading ? (
            <div className="p-4 space-y-2">
              <Skeleton variant="card" height="h-12" rounded="rounded-md" count={3} />
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-muted">
              Nenhuma atividade recente.
            </div>
          ) : (
            <div className="p-2">
              {recentActivity.map((activity) => (
                <div
                  key={activity.type === 'sale' ? `sale-${activity.id}` : `prod-${activity.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-md hover:bg-surface-hover transition-colors"
                >
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center [&_svg]:w-4 [&_svg]:h-4 ${
                      activity.type === 'sale'
                        ? 'bg-success/15 text-success'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    <FontAwesomeIcon icon={activity.type === 'sale' ? faMoneyBillWave : faBoxOpen} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-main truncate">
                      {activity.type === 'sale'
                        ? `Venda de ${formatCurrency(Number(activity.price))}`
                        : `Produto: ${activity.name}`}
                    </p>
                    <p className="text-xs text-text-subtle">
                      {formatDate(activity.type === 'sale' ? activity.purchaseDate : activity.createdAt)}
                    </p>
                  </div>
                  {activity.type === 'sale' && activity.qrCodeScanned && (
                    <FontAwesomeIcon icon={faQrcode} className="w-3.5 h-3.5 text-text-subtle" />
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
