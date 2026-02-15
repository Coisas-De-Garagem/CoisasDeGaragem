import { Card } from '@/components/common/Card';
import { api } from '@/services/api';
import { useEffect, useState, useRef } from 'react';
import type { Testimonial } from '@/types';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

gsap.registerPlugin(ScrollTrigger);

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const result = await api.getTestimonials({ isFeatured: true, isVisible: true, limit: 3 });
        if (result.success) {
          setTestimonials(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  useGSAP(() => {
    if (loading || testimonials.length === 0) return;

    const cards = gsap.utils.toArray('.testimonial-card');

    gsap.fromTo(cards,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        }
      }
    );
  }, { scope: containerRef, dependencies: [loading, testimonials] });

  if (loading) {
    return (
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="py-24 bg-white border-t border-gray-100 relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-2">
            Depoimentos
          </h2>
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            A comunidade aprova
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card h-full">
              <Card className="p-8 h-full bg-white border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-2xl flex flex-col">
                <div className="flex items-center gap-1 mb-6 text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FontAwesomeIcon
                      key={star}
                      icon={faStar}
                      className={`w-5 h-5 ${star <= testimonial.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                    />
                  ))}
                </div>

                <p className="text-gray-600 mb-8 flex-grow text-lg italic leading-relaxed">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gray-50">
                  <div className="flex-shrink-0">
                    {testimonial.userAvatarUrl ? (
                      <img
                        src={testimonial.userAvatarUrl}
                        alt={testimonial.userName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 flex items-center justify-center text-lg font-bold">
                        {testimonial.userName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {testimonial.userName}
                    </h4>
                    <span className="text-sm text-gray-500">
                      Usuário Verificado
                    </span>
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
