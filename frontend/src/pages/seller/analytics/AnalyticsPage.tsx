import { useCallback, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faLightbulb,
  faTrophy,
  faCalendarDays,
  faChartColumn,
  faArrowsRotate,
  faBullseye,
} from '@fortawesome/free-solid-svg-icons';
import { SalesChart } from '@/components/seller/SalesChart';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import { api } from '@/services/api';
import type { AnalyticsData, Purchase } from '@/types';

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
        api.getPurchases({ limit: 50 }),
      ]);

      if (analyticsRes.success) setAnalyticsData(analyticsRes.data);
      else setError('Erro ao carregar métricas.');

      if (purchasesRes.success) setPurchases(purchasesRes.data.purchases);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Ocorreu um erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAllData();
  }, [fetchAllData]);

  if (loading && !analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-primary">
        <Spinner size="lg" />
        <p className="text-text-muted mt-3 text-sm">Analisando seus dados de vendas...</p>
      </div>
    );
  }

  const goalProgress = Math.min(((analyticsData?.totalSales || 0) / 10) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
            <FontAwesomeIcon icon={faChartColumn} className="w-3.5 h-3.5" />
            Desempenho
          </span>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-main tracking-tight">
            Estatísticas e analytics
          </h1>
          <p className="text-text-muted mt-1">
            Acompanhe o crescimento do seu negócio e identifique oportunidades.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchAllData}
          isLoading={loading}
          leftIcon={<FontAwesomeIcon icon={faArrowsRotate} className={loading ? 'animate-spin' : ''} />}
        >
          Atualizar dados
        </Button>
      </div>

      {error && (
        <Alert variant="error" dismissible onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Gráfico + métricas principais */}
      {analyticsData && (
        <SalesChart data={analyticsData} purchases={purchases} loading={loading} />
      )}

      {/* Insights + Meta */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insights estratégicos */}
        <Card>
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-text-main flex items-center gap-2">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent/15 text-accent-600 dark:text-accent-300 [&_svg]:w-5 [&_svg]:h-5">
                <FontAwesomeIcon icon={faLightbulb} />
              </span>
              Insights estratégicos
            </h2>
          </div>
          <ul className="p-3 space-y-1">
            <InsightItem
              icon={<FontAwesomeIcon icon={faChartLine} />}
              tone="primary"
              title="Tendência de vendas"
              text={
                analyticsData?.totalSales && analyticsData.totalSales > 0
                  ? 'Suas vendas mostram um padrão positivo de crescimento nesta semana.'
                  : 'Ainda não há dados suficientes. Continue listando produtos!'
              }
            />
            <InsightItem
              icon={<FontAwesomeIcon icon={faTrophy} />}
              tone="success"
              title="Conversão de clientes"
              text={`Você alcançou ${analyticsData?.uniqueBuyers || 0} compradores únicos. Cada cliente novo fortalece sua reputação.`}
            />
            <InsightItem
              icon={<FontAwesomeIcon icon={faCalendarDays} />}
              tone="accent"
              title="Melhor momento"
              text="Fim de semana costuma ser o pico de buscas por itens de garagem. Considere atualizar o estoque nas sextas."
            />
          </ul>
        </Card>

        {/* Meta / gamificação */}
        <Card>
          <div className="p-5">
            <h3 className="text-base font-medium text-text-main flex items-center gap-2">
              <span className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 text-primary [&_svg]:w-5 [&_svg]:h-5">
                <FontAwesomeIcon icon={faBullseye} />
              </span>
              Meta próxima
            </h3>
            <p className="text-text-muted mt-2 text-sm">
              Venda mais para desbloquear novos recursos no seu painel.
            </p>

            <div className="mt-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-main font-medium">Vendedor Bronze</span>
                <span className="text-text-muted">{analyticsData?.totalSales || 0}/10</span>
              </div>
              <div className="w-full bg-surface-hover rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all duration-700"
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
            </div>

            <div className="mt-5 bg-surface-2 rounded-md p-3.5">
              <p className="text-sm text-text-muted flex items-start gap-2">
                <FontAwesomeIcon icon={faChartLine} className="w-4 h-4 mt-0.5 text-text-subtle flex-shrink-0" />
                <span>Dica: produtos com fotos de alta qualidade vendem até 70% mais rápido.</span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function InsightItem({
  icon,
  tone,
  title,
  text,
}: {
  icon: React.ReactNode;
  tone: 'primary' | 'success' | 'accent';
  title: string;
  text: string;
}) {
  const toneClasses = {
    primary: 'text-primary',
    success: 'text-success',
    accent: 'text-accent-600 dark:text-accent-300',
  };
  return (
    <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
      <span
        className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-surface [&_svg]:w-4 [&_svg]:h-4 ${toneClasses[tone]}`}
      >
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-text-main">{title}</p>
        <p className="text-sm text-text-muted mt-0.5">{text}</p>
      </div>
    </li>
  );
}
