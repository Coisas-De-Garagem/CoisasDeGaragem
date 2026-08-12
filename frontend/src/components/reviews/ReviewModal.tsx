import { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Textarea } from '@/components/common/Textarea';
import { api } from '@/services/api';
import { useUIStore } from '@/store/uiStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import type { Purchase } from '@/types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase | null;
  onSuccess: () => void;
}

export function ReviewModal({ isOpen, onClose, purchase, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useUIStore();

  const handleSubmit = async () => {
    if (!purchase || rating === 0) return;
    setIsSubmitting(true);
    try {
      const result = await api.createReview({
        purchaseId: purchase.id,
        rating,
        comment,
      });

      if (result.success) {
        addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Avaliação enviada',
          message: 'Obrigado por avaliar sua compra!',
          createdAt: new Date().toISOString(),
          userId: '',
          isRead: false,
        });
        onSuccess();
        onClose();
        setRating(0);
        setComment('');
      } else {
        addNotification({
          id: Date.now().toString(),
          type: 'error',
          title: 'Erro ao avaliar',
          message: result.error?.message || 'Não foi possível enviar a avaliação.',
          createdAt: new Date().toISOString(),
          userId: '',
          isRead: false,
        });
      }
    } catch {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erro inesperado',
        message: 'Ocorreu um erro ao enviar a avaliação.',
        createdAt: new Date().toISOString(),
        userId: '',
        isRead: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Avaliar Compra"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting} disabled={rating === 0}>
            Enviar Avaliação
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {purchase && (
          <p className="text-sm text-text-muted">
            Como foi sua experiência comprando <strong>{purchase.product?.name}</strong> de <strong>{purchase.seller?.name || 'Vendedor'}</strong>?
          </p>
        )}
        
        <div className="flex justify-center gap-2 py-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`text-3xl transition-colors ${
                (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-neutral-300 dark:text-neutral-700'
              }`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <FontAwesomeIcon icon={faStar} />
            </button>
          ))}
        </div>

        <Textarea
          label="Comentário (opcional)"
          placeholder="Conte um pouco mais sobre a sua compra..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
      </div>
    </Modal>
  );
}
