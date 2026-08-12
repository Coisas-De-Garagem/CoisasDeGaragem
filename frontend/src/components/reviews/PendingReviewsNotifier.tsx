import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { ReviewModal } from './ReviewModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faXmark } from '@fortawesome/free-solid-svg-icons';
import type { Purchase } from '@/types';

export function PendingReviewsNotifier() {
  const [pendingReviews, setPendingReviews] = useState<Purchase[]>([]);
  const [currentReview, setCurrentReview] = useState<Purchase | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const result = await api.getPendingReviews();
        if (result.success && result.data && result.data.length > 0) {
          setPendingReviews(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch pending reviews', err);
      }
    };
    fetchPending();
  }, []);

  const handleEvaluate = () => {
    if (pendingReviews.length > 0) {
      setCurrentReview(pendingReviews[0]);
      setShowModal(true);
    }
  };

  const handleSuccess = () => {
    const remaining = pendingReviews.slice(1);
    setPendingReviews(remaining);
    if (remaining.length === 0) {
      setDismissed(true);
    }
  };

  if (pendingReviews.length === 0 || dismissed) {
    return null;
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50 animate-slide-down">
        <div className="bg-surface border border-border shadow-lg rounded-lg p-4 flex items-start gap-4 max-w-sm w-full">
          <div className="flex-shrink-0 text-yellow-400 bg-yellow-400/10 w-10 h-10 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faStar} className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h4 className="text-sm font-bold text-text-main">Avalie sua compra</h4>
            <p className="text-xs text-text-muted mt-1">
              Você tem {pendingReviews.length} compra{pendingReviews.length > 1 ? 's' : ''} aguardando avaliação.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleEvaluate}
                className="text-xs font-semibold text-white bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-md transition-colors"
              >
                Avaliar agora
              </button>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 text-text-subtle hover:text-text-main transition-colors -mt-1 -mr-1 p-1"
            aria-label="Fechar notificação"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ReviewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        purchase={currentReview}
        onSuccess={handleSuccess}
      />
    </>
  );
}
