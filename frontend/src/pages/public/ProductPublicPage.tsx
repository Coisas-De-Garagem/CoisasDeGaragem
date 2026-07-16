import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStore,
  faCircleCheck,
  faCircleExclamation,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import { api } from '@/services/api';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { Spinner } from '@/components/common/Spinner';
import { Alert } from '@/components/common/Alert';
import { EmptyState } from '@/components/common/EmptyState';
import type { Product } from '@/types';
import { useUIStore } from '@/store/uiStore';
import { formatProductCondition, getConditionVariant } from '@/utils/formatters';

const currency = (value: number, curr = 'BRL') =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: curr }).format(value);

export default function ProductPublicPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState(false);

  const { addNotification } = useUIStore();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const result = await api.getProduct(id);
        if (result.success) setProduct(result.data);
        else setError(result.error?.message || 'Produto não encontrado');
      } catch {
        setError('Erro ao carregar produto');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

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
          title: 'Reserva realizada',
          message: 'O produto foi reservado com sucesso!',
          createdAt: new Date().toISOString(),
          userId: '',
          isRead: false,
        });
      } else {
        addNotification({
          id: Date.now().toString(),
          type: 'error',
          title: 'Erro na reserva',
          message: result.error?.message || 'Erro ao reservar produto',
          createdAt: new Date().toISOString(),
          userId: '',
          isRead: false,
        });
      }
    } catch {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erro',
        message: 'Erro ao realizar reserva. Tente novamente.',
        createdAt: new Date().toISOString(),
        userId: '',
        isRead: false,
      });
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-primary">
        <Spinner size="lg" />
        <p className="mt-3 text-text-muted text-sm">Carregando produto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <EmptyState
            icon={<FontAwesomeIcon icon={faCircleExclamation} />}
            title="Ops! Algo deu errado"
            description={error || 'Não conseguimos encontrar o produto solicitado.'}
            action={<Button variant="primary" onClick={() => navigate('/')}>Voltar ao início</Button>}
          />
        </Card>
      </div>
    );
  }

  const isSold = product.isSold;
  const isReserved = product.isReserved;
  const isAvailable = product.isAvailable && !isReserved && !isSold;
  const sellerName = (product as Product & { seller?: { name?: string } }).seller?.name;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <Card flush className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Imagem */}
          <div className="relative h-72 sm:h-96 md:h-auto bg-surface-2">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-text-subtle gap-2">
                <FontAwesomeIcon icon={faImage} className="w-10 h-10 opacity-40" />
                <span className="text-sm">Sem imagem</span>
              </div>
            )}
            <div className="absolute top-3 left-3">
              {isSold ? (
                <Badge variant="error">Vendido</Badge>
              ) : isReserved ? (
                <Badge variant="warning">Reservado</Badge>
              ) : (
                <Badge variant="success" dot>Disponível</Badge>
              )}
            </div>
          </div>

          {/* Detalhes */}
          <div className="p-6 sm:p-8 flex flex-col">
            {product.category && (
              <span className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
                {product.category}
              </span>
            )}
            <h1 className="text-2xl font-semibold text-text-main leading-tight">
              {product.name}
            </h1>
            <p className="text-2xl font-semibold text-text-main mt-2">
              {currency(product.price, product.currency)}
            </p>

            <div className="mt-5">
              <p className="text-xs font-medium text-text-subtle uppercase tracking-wide mb-1">
                Descrição
              </p>
              <p className="text-text-muted leading-relaxed text-sm">{product.description}</p>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-text-muted">Condição</span>
                <Badge variant={getConditionVariant(product.condition)}>
                  {formatProductCondition(product.condition)}
                </Badge>
              </div>
              {sellerName && (
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-text-muted">Vendedor</span>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-text-main">
                    <FontAwesomeIcon icon={faStore} className="w-3.5 h-3.5 text-primary" />
                    {sellerName}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6">
              {isAvailable ? (
                <Button variant="primary" size="lg" fullWidth onClick={() => setShowConfirmModal(true)}>
                  Arrematar agora
                </Button>
              ) : isReserved ? (
                <Alert variant="warning" title="Produto reservado">
                  Alguém chegou antes. Este item já está reservado.
                </Alert>
              ) : (
                <Alert variant="info" title="Vendido">
                  Este item já encontrou um novo lar.
                </Alert>
              )}
            </div>
          </div>
        </div>
      </Card>

      <p className="mt-6 text-center text-text-subtle text-xs">
        Produto de um garage sale organizado via CoisasDeGaragem
      </p>

      {/* Confirmação de reserva */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar reserva"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleReserve} isLoading={reserving}>
              Sim, reservar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Alert variant="info">
            Ao reservar, este produto ficará exclusivamente para você. Procure o vendedor no local
            para pagar e retirar o item.
          </Alert>
          <div className="flex justify-between items-center font-medium">
            <span className="text-text-main">{product.name}</span>
            <span className="text-primary">{currency(product.price, product.currency)}</span>
          </div>
        </div>
      </Modal>

      {/* Sucesso */}
      <Modal
        isOpen={reserveSuccess}
        onClose={() => setReserveSuccess(false)}
        title="Reserva concluída!"
        size="md"
      >
        <div className="text-center">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success/15 text-success mb-4 [&_svg]:w-7 [&_svg]:h-7">
            <FontAwesomeIcon icon={faCircleCheck} />
          </span>
          <h2 className="text-lg font-semibold text-text-main mb-1">Pronto!</h2>
          <p className="text-text-muted mb-6 text-sm">
            <strong>{product.name}</strong> está reservado para você.
          </p>

          <div className="bg-surface-2 p-4 rounded-lg text-left mb-6">
            <h4 className="font-medium text-text-main mb-2 text-sm">Próximos passos</h4>
            <ol className="space-y-1 text-sm text-text-muted list-decimal list-inside">
              <li>Procure o vendedor do garage sale</li>
              <li>Informe que você reservou o item pelo site</li>
              <li>Faça o pagamento e leve seu item</li>
            </ol>
          </div>

          <Button variant="primary" fullWidth onClick={() => setReserveSuccess(false)}>
            Entendido
          </Button>
        </div>
      </Modal>
    </div>
  );
}
