/**
 * Skeletons de layout que espelham a estrutura real das páginas.
 *
 * O objetivo é ocupar exatamente o mesmo espaço que o conteúdo final,
 * evitando o reflow/jump que acontece quando o spinner é trocado pelo
 * conteúdo (notavelmente no dashboard do vendedor). Por isso as classes de
 * grid/spacing aqui são idênticas às das páginas reais.
 */
import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';

/** Cabeçalho padrão de página: título grande + linha de subtítulo. */
export function PageHeaderSkeleton() {
  return (
    <div>
      <Skeleton height="h-8" width="w-64" rounded="rounded-md" />
      <Skeleton height="h-4" width="w-80" rounded="rounded-md" className="mt-2" />
    </div>
  );
}

/**
 * Grade de StatCards (métricas). Espelha o grid `2 cols mobile / N cols lg`
 * usado em Sales, Purchases e dentro do SalesChart.
 */
export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-surface rounded-xl border border-border shadow-sm p-4 sm:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton height="h-3" width="w-24" />
              <Skeleton height="h-6" width="w-16" />
            </div>
            <Skeleton variant="circular" width="w-10" height="h-10" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Card de filtros vazio — apenas a "moldura", para preservar a altura do
 * bloco de busca/ordenação enquanto os dados chegam.
 */
export function FiltersBarSkeleton() {
  return (
    <Card flush>
      <div className="p-4 flex flex-col lg:flex-row gap-3">
        <div className="flex-1">
          <Skeleton height="h-10" rounded="rounded-md" />
        </div>
        <div className="flex gap-3">
          <Skeleton height="h-10" width="w-40" rounded="rounded-md" />
          <Skeleton height="h-10" width="w-44" rounded="rounded-md" />
        </div>
      </div>
    </Card>
  );
}

/**
 * Grade de cards de produto/compra (Products, Purchases).
 * Espelha `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
 */
export function CardGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4 space-y-3">
          <Skeleton height="h-40" rounded="rounded-lg" />
          <Skeleton height="h-5" width="w-3/4" />
          <Skeleton height="h-4" width="w-full" />
          <Skeleton height="h-4" width="w-2/3" />
          <div className="flex gap-2 pt-2">
            <Skeleton height="h-9" width="w-24" rounded="rounded-md" />
            <Skeleton height="h-9" width="w-24" rounded="rounded-md" />
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * Esqueleto de tabela (desktop) + lista (mobile) usado em Sales e History.
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card flush>
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-sunken/60">
            <tr>
              {Array.from({ length: 5 }).map((_, i) => (
                <th key={i} className="px-5 py-3">
                  <Skeleton height="h-3" width="w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: 5 }).map((_, c) => (
                  <td key={c} className="px-5 py-3.5">
                    <Skeleton height="h-4" width={c === 0 ? 'w-24' : 'w-16'} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile */}
      <ul className="md:hidden divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton height="h-4" width="w-20" />
              <Skeleton height="h-5" width="w-16" rounded="rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton height="h-3" width="w-24" />
              <Skeleton height="h-4" width="w-14" />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/**
 * Skeleton do dashboard do vendedor: 6 StatCards + área do gráfico.
 * Espelha o loading state interno do <SalesChart>.
 */
export function DashboardChartSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface rounded-xl border border-border shadow-sm p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton height="h-3" width="w-24" />
                <Skeleton height="h-6" width="w-16" />
              </div>
              <Skeleton variant="circular" width="w-10" height="h-10" />
            </div>
          </div>
        ))}
      </div>
      <Card>
        <div className="px-5 py-4 border-b border-border space-y-2">
          <Skeleton height="h-4" width="w-44" />
          <Skeleton height="h-3" width="w-32" />
        </div>
        <div className="p-4 h-[320px] sm:h-[380px] w-full">
          <Skeleton height="h-full" rounded="rounded-lg" />
        </div>
      </Card>
    </div>
  );
}
