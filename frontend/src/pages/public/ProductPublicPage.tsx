import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { Spinner } from '@/components/common/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faCheckCircle, faShoppingBag, faClock, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import type { Product } from '@/types';
import { useUIStore } from '@/store/uiStore';

export default function ProductPublicPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [reserving, setReserving] = useState(false);
    const [reserveSuccess, setReserveSuccess] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                const result = await api.getProduct(id);
                if (result.success) {
                    setProduct(result.data);
                } else {
                    setError(result.error?.message || 'Produto não encontrado');
                }
            } catch (err) {
                setError('Erro ao carregar produto');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const { addNotification } = useUIStore();

    const handleReserve = async () => {
        if (!product) return;
        setReserving(true);
        try {
            const result = await api.reserveProduct(product.id);
            if (result.success) {
                setReserveSuccess(true);
                setShowConfirmModal(false);
                setProduct(result.data);
                addNotification({
                    id: Date.now().toString(),
                    type: 'success',
                    title: 'Reserva Realizada',
                    message: 'O produto foi reservado com sucesso!',
                    createdAt: new Date().toISOString(),
                    userId: '',
                    isRead: false
                });
            } else {
                addNotification({
                    id: Date.now().toString(),
                    type: 'error',
                    title: 'Erro na Reserva',
                    message: result.error?.message || 'Erro ao reservar produto',
                    createdAt: new Date().toISOString(),
                    userId: '',
                    isRead: false
                });
            }
        } catch (err) {
            addNotification({
                id: Date.now().toString(),
                type: 'error',
                title: 'Erro',
                message: 'Erro ao realizar reserva. Tente novamente.',
                createdAt: new Date().toISOString(),
                userId: '',
                isRead: false
            });
        } finally {
            setReserving(false);
        }
    };

    if (loading) {
        return (
            <PageLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center">
                    <Spinner />
                    <p className="mt-4 text-gray-500 font-medium">Carregando detalhes do produto...</p>
                </div>
            </PageLayout>
        );
    }

    if (error || !product) {
        return (
            <PageLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                        <FontAwesomeIcon icon={faExclamationCircle} className="text-4xl" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Ops! Alguma coisa deu errado.</h2>
                    <p className="text-gray-600 mb-8 max-w-md">{error || 'Não conseguimos encontrar o produto solicitado.'}</p>
                    <Button variant="primary" onClick={() => navigate('/')}>
                        Voltar para o Início
                    </Button>
                </div>
            </PageLayout>
        );
    }

    const isSold = product.isSold;
    const isReserved = product.isReserved;
    const isAvailable = product.isAvailable && !isReserved && !isSold;

    return (
        <PageLayout>
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Image Section */}
                        <div className="relative h-96 md:h-auto bg-gray-50">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-4">
                                    <FontAwesomeIcon icon={faShoppingBag} className="text-7xl opacity-50" />
                                    <span className="font-medium">Sem imagem disponível</span>
                                </div>
                            )}

                            <div className="absolute top-6 left-6">
                                {isSold ? (
                                    <Badge variant="error" className="px-4 py-2 text-sm font-bold shadow-lg">VENDIDO</Badge>
                                ) : isReserved ? (
                                    <Badge variant="warning" className="px-4 py-2 text-sm font-bold shadow-lg">RESERVADO</Badge>
                                ) : (
                                    <Badge variant="success" className="px-4 py-2 text-sm font-bold shadow-lg">DISPONÍVEL</Badge>
                                )}
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8 md:p-12 flex flex-col">
                            <div className="mb-6">
                                {product.category && (
                                    <span className="text-blue-600 font-bold text-sm tracking-wider uppercase mb-2 block">
                                        {product.category}
                                    </span>
                                )}
                                <h1 className="text-4xl font-black text-gray-900 leading-tight mb-4 tracking-tight">
                                    {product.name}
                                </h1>
                                <div className="text-4xl font-black text-blue-600 mb-6 font-mono tracking-tighter">
                                    {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: product.currency || 'BRL',
                                    }).format(product.price)}
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Descrição</h3>
                                    <p className="text-gray-600 leading-relaxed text-lg">
                                        {product.description}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-10">
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <span className="text-gray-500 font-medium">Condição</span>
                                    <Badge variant="success" className="font-bold">{product.condition || 'Bom'}</Badge>
                                </div>
                                {/* @ts-ignore - Assuming seller might have a name in the response */}
                                {product.seller && (
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                        <span className="text-gray-500 font-medium">Vendedor</span>
                                        <span className="flex items-center gap-2 font-bold text-gray-800">
                                            <FontAwesomeIcon icon={faStore} className="text-blue-500" />
                                            {/* @ts-ignore */}
                                            {product.seller.name}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto">
                                {isAvailable ? (
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-full h-16 text-xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200"
                                        onClick={() => setShowConfirmModal(true)}
                                    >
                                        Arrematar Agora
                                    </Button>
                                ) : isReserved ? (
                                    <div className="bg-orange-50 text-orange-800 p-6 rounded-2xl border border-orange-200 flex items-center gap-4">
                                        <FontAwesomeIcon icon={faClock} className="text-2xl animate-pulse" />
                                        <div>
                                            <p className="font-bold text-lg">Este produto já foi reservado</p>
                                            <p className="text-sm opacity-80">Alguém chegou um pouquinho antes de você!</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-100 text-gray-500 p-6 rounded-2xl border border-gray-200 flex items-center gap-4">
                                        <FontAwesomeIcon icon={faShoppingBag} className="text-2xl" />
                                        <div>
                                            <p className="font-bold text-lg">Vendido!</p>
                                            <p className="text-sm opacity-80">Este item já encontrou um novo lar.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <p className="mt-12 text-center text-gray-400 text-sm">
                    Este produto faz parte de um Garage Sale organizado via <span className="font-bold text-gray-500">CoisasDeGaragem.com</span>
                </p>
            </div>

            {/* Reservation Confirmation Modal */}
            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Confirmar Reserva"
                size="md"
            >
                <div className="p-2">
                    <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-6 flex items-start gap-3">
                        <FontAwesomeIcon icon={faExclamationCircle} className="mt-1" />
                        <p className="text-sm font-medium">
                            Ao arrematar, este produto ficará reservado exclusivamente para você.
                            Por favor, procure o vendedor no local para efetuar o pagamento e retirar o item.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>{product.name}</span>
                            <span className="text-blue-600">
                                {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: product.currency || 'BRL',
                                }).format(product.price)}
                            </span>
                        </div>

                        <p className="text-gray-600">
                            Deseja confirmar a reserva deste produto?
                        </p>

                        <div className="flex gap-4 pt-4">
                            <Button variant="secondary" className="flex-1 h-12" onClick={() => setShowConfirmModal(false)}>
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
                                onClick={handleReserve}
                                isLoading={reserving}
                            >
                                Sim, Arrematar!
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Success Modal */}
            <Modal
                isOpen={reserveSuccess}
                onClose={() => setReserveSuccess(false)}
                title="Reserva Concluída!"
                size="md"
            >
                <div className="text-center py-8">
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-5xl" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Parabéns!</h2>
                    <p className="text-gray-600 text-lg mb-8 max-w-xs mx-auto">
                        O produto <strong>{product.name}</strong> agora está reservado para você.
                    </p>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-left mb-10">
                        <h4 className="font-bold text-gray-900 mb-2">Próximos passos:</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex gap-2">
                                <span className="text-emerald-500 font-bold">1.</span>
                                Procure o vendedor do Garage Sale
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-500 font-bold">2.</span>
                                Informe que você arrematou o item pelo site
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-500 font-bold">3.</span>
                                Faça o pagamento e leve seu novo tesouro!
                            </li>
                        </ul>
                    </div>
                    <Button variant="primary" className="w-full h-14 text-lg" onClick={() => setReserveSuccess(false)}>
                        Entendido
                    </Button>
                </div>
            </Modal>
        </PageLayout>
    );
}
