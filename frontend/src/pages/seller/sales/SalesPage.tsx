import { SellerLayout } from '@/components/seller/SellerLayout';
import { usePurchases } from '@/hooks/usePurchases';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { Spinner } from '@/components/common/Spinner';
import { useEffect, useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faDownload } from '@fortawesome/free-solid-svg-icons';

export default function SalesPage() {
    const { user } = useAuthStore();
    const { purchases, fetchSales } = usePurchases();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState('all');

    useEffect(() => {
        const loadData = async () => {
            try {
                await fetchSales();
            } catch (error) {
                console.error('Falha ao carregar vendas:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [fetchSales]);

    const filteredSales = useMemo(() => {
        if (!user) return [];

        return purchases.filter((purchase) => {
            if (purchase.sellerId !== user.id) return false;

            if (searchTerm && !purchase.id.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            if (statusFilter !== 'all' && purchase.status !== statusFilter) return false;

            if (dateRange !== 'all') {
                const date = new Date(purchase.purchaseDate);
                const now = new Date();
                if (dateRange === 'today') {
                    if (date.toDateString() !== now.toDateString()) return false;
                } else if (dateRange === 'week') {
                    const weekAgo = new Date(now);
                    weekAgo.setDate(now.getDate() - 7);
                    if (date < weekAgo) return false;
                } else if (dateRange === 'month') {
                    const monthAgo = new Date(now);
                    monthAgo.setMonth(now.getMonth() - 1);
                    if (date < monthAgo) return false;
                }
            }

            return true;
        });
    }, [purchases, user, searchTerm, statusFilter, dateRange]);

    const stats = useMemo(() => {
        const total = filteredSales.length;
        const revenue = filteredSales.reduce((acc, curr) => acc + curr.price, 0);
        const pending = filteredSales.filter(s => s.status === 'pending').length;
        const completed = filteredSales.filter(s => s.status === 'completed').length;
        return { total, revenue, pending, completed };
    }, [filteredSales]);

    if (loading) {
        return (
            <SellerLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Spinner size="lg" />
                </div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Minhas Vendas</h1>
                    <p className="text-gray-500">Gerencie e acompanhe o desempenho das suas vendas</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-6 border-l-4 border-primary">
                        <h3 className="text-sm font-medium text-gray-500">Vendas Totais</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
                    </Card>
                    <Card className="p-6 border-l-4 border-green-500">
                        <h3 className="text-sm font-medium text-gray-500">Receita Total</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenue)}
                        </p>
                    </Card>
                    <Card className="p-6 border-l-4 border-yellow-500">
                        <h3 className="text-sm font-medium text-gray-500">Pendentes</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pending}</p>
                    </Card>
                    <Card className="p-6 border-l-4 border-blue-500">
                        <h3 className="text-sm font-medium text-gray-500">Concluídas</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{stats.completed}</p>
                    </Card>
                </div>

                <Card className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
                            <div className="relative w-full md:max-w-xs">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <FontAwesomeIcon icon={faSearch} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar por ID..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-primary"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                options={[
                                    { value: 'all', label: 'Todos os Status' },
                                    { value: 'completed', label: 'Concluído' },
                                    { value: 'pending', label: 'Pendente' },
                                    { value: 'cancelled', label: 'Cancelado' },
                                ]}
                                className="w-full md:w-48"
                            />

                            <Select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                options={[
                                    { value: 'all', label: 'Todo o Período' },
                                    { value: 'today', label: 'Hoje' },
                                    { value: 'week', label: 'Última Semana' },
                                    { value: 'month', label: 'Último Mês' },
                                ]}
                                className="w-full md:w-48"
                            />
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            <Button variant="tertiary" className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faDownload} />
                                <span>Exportar CSV</span>
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Venda</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSales.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            Nenhuma venda encontrada.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSales.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{sale.id.split('-')[1]}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(sale.purchaseDate).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: sale.currency }).format(sale.price)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={
                                                    sale.status === 'completed' ? 'success' :
                                                        sale.status === 'pending' ? 'warning' : 'error'
                                                }>
                                                    {sale.status === 'completed' ? 'Concluído' :
                                                        sale.status === 'pending' ? 'Pendente' : 'Cancelado'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <Button variant="tertiary" size="sm">Detalhes</Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </SellerLayout>
    );
}
