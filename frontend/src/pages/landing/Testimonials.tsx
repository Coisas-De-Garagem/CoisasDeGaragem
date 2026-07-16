import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Card } from '@/components/common/Card';
import { Avatar } from '@/components/common/Avatar';
import { Rating } from '@/components/common/Rating';
import { Skeleton } from '@/components/common/Skeleton';
import { api } from '@/services/api';
import type { Testimonial } from '@/types';

gsap.registerPlugin(ScrollTrigger);

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (testimonials.length === 0) return null;

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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((testimonial) => (
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
      </div>
    </section>
  );
}
