import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Card } from '@/components/common/Card';
import { Avatar } from '@/components/common/Avatar';
import { Rating } from '@/components/common/Rating';
import { Skeleton } from '@/components/common/Skeleton';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Textarea } from '@/components/common/Textarea';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faPenNib } from '@fortawesome/free-solid-svg-icons';
import { api } from '@/services/api';
import type { Testimonial } from '@/types';
import { LoginModal } from '@/components/auth/LoginModal';

gsap.registerPlugin(ScrollTrigger);

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useUIStore();
  const { isAuthenticated, user } = useAuthStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const result = await api.getTestimonials({ isFeatured: true, isVisible: true, limit: 3 });
        if (result.success) setTestimonials(result.data);
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  const handleOpenReviewModal = () => {
    if (isAuthenticated) {
      setIsModalOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    // When login modal succeeds, open review modal
    setIsModalOpen(true);
  };

  const chunks: Testimonial[][] = [];
  for (let i = 0; i < testimonials.length; i += 3) {
    chunks.push(testimonials.slice(i, i + 3));
  }
  const [currentPage, setCurrentPage] = useState(0);
  const currentTestimonials = chunks[currentPage] || [];

  // Interval para rotação (6 segundos)
  useEffect(() => {
    if (chunks.length <= 1) return;
    const interval = setInterval(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.testimonial-card');
      gsap.to(cards, {
        y: -20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        onComplete: () => {
          setCurrentPage((prev) => (prev + 1) % chunks.length);
        },
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [chunks.length]);

  // Animação de entrada
  useGSAP(
    () => {
      if (loading || currentTestimonials.length === 0) return;
      const cards = gsap.utils.toArray<HTMLElement>('.testimonial-card');
      gsap.fromTo(
        cards,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          scrollTrigger: currentPage === 0 ? { trigger: containerRef.current, start: 'top 85%' } : undefined,
        },
      );
    },
    { scope: containerRef, dependencies: [currentPage, loading, currentTestimonials.length] },
  );

  const handleSubmitReview = async () => {
    if (!content.trim()) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Campo obrigatório',
        message: 'Preencha o seu depoimento.',
        createdAt: new Date().toISOString(),
        userId: '',
        isRead: false,
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await api.createTestimonial({ rating, content });
      
      if (result.success) {
        addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Depoimento enviado!',
          message: 'Muito obrigado pela sua avaliação!',
          createdAt: new Date().toISOString(),
          userId: '',
          isRead: false,
        });
        
        setIsModalOpen(false);
        setRating(5);
        setContent('');
        
        // Optionally append the new testimonial to the local list if it should be immediately visible
        // However, the backend might have it as isFeatured: false by default, so we may just reload the page or do nothing.
      } else {
        throw new Error(result.error?.message || 'Erro ao enviar avaliação');
      }
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erro',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        createdAt: new Date().toISOString(),
        userId: '',
        isRead: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useGSAP(
    () => {
      if (loading || testimonials.length === 0) return;
      const cards = gsap.utils.toArray<HTMLElement>('.testimonial-card');
      gsap.fromTo(
        cards,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          scrollTrigger: { trigger: containerRef.current, start: 'top 85%' },
        },
      );
    },
    { scope: containerRef, dependencies: [loading, testimonials] },
  );

  if (loading) {
    return (
      <section className="py-16 bg-surface border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="card" height="h-44" />
            ))}
          </div>
        </div>
      </section>
    );
  }



  return (
    <section ref={containerRef} className="py-16 bg-surface border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            Depoimentos
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-text-main mt-2">
            A comunidade aprova
          </h2>
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              leftIcon={<FontAwesomeIcon icon={faPenNib} />}
              onClick={handleOpenReviewModal}
            >
              Deixar uma avaliação
            </Button>
          </div>
        </div>

        {testimonials.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center w-full min-h-[18rem] bg-surface-hover/50 rounded-xl border border-dashed border-border p-6">
            <p className="text-text-muted">Ainda não há avaliações. Seja o primeiro a contar a sua experiência!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[18rem]">
            {currentTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card h-full">
                <Card className="h-full">
                  <div className="p-5 flex flex-col h-full">
                    <Rating value={testimonial.rating} size="sm" className="mb-3" />
                    <p className="text-text-muted flex-grow leading-relaxed text-sm mb-4">
                      “{testimonial.content}”
                    </p>
                    <div className="flex items-center gap-2.5 pt-3 border-t border-border">
                      <Avatar name={testimonial.userName} src={testimonial.userAvatarUrl} size="sm" />
                      <div>
                        <p className="font-medium text-text-main text-sm">{testimonial.userName}</p>
                        <span className="text-xs text-text-subtle">Usuário verificado</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
        
        {chunks.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {chunks.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentPage ? 'bg-primary w-4' : 'bg-border-strong hover:bg-text-subtle'
                }`}
                onClick={() => {
                  const cards = gsap.utils.toArray<HTMLElement>('.testimonial-card');
                  gsap.to(cards, {
                    y: -20,
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => setCurrentPage(idx),
                  });
                }}
                aria-label={`Ir para página ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Avaliar CoisasDeGaragem"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button variant="primary" onClick={handleSubmitReview} isLoading={isSubmitting}>Enviar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Olá, <span className="font-medium text-text-main">{user?.name}</span>! Conte para nós o que achou da plataforma e ajude a comunidade!
          </p>
          
          <div className="flex justify-center gap-2 py-2">
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
            label="Seu depoimento"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="O que você achou da plataforma?"
            rows={4}
          />
        </div>
      </Modal>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onSuccess={handleLoginSuccess}
      />
    </section>
  );
}
