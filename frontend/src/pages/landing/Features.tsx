import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQrcode,
  faChartColumn,
  faMobileScreenButton,
  faWandMagicSparkles,
  faClock,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

gsap.registerPlugin(ScrollTrigger);

interface Feature {
  icon: IconDefinition;
  title: string;
  description: string;
}

export function Features() {
  const containerRef = useRef<HTMLDivElement>(null);

  const features: Feature[] = [
    { icon: faQrcode, title: 'QR codes únicos', description: 'Cada produto recebe um código exclusivo para escanear e vender.' },
    { icon: faChartColumn, title: 'Analytics em tempo real', description: 'Acompanhe vendas e receita enquanto acontecem.' },
    { icon: faMobileScreenButton, title: 'Mobile first', description: 'Interface otimizada para qualquer dispositivo.' },
    { icon: faWandMagicSparkles, title: 'Simples e intuitivo', description: 'Cadastre, imprima e comece a vender.' },
    { icon: faClock, title: 'Economize tempo', description: 'Automatize vendas e evite filas.' },
    { icon: faShieldHalved, title: 'Pagamento seguro', description: 'Transações via PIX ou cartão com proteção.' },
  ];

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>('.feature-card');
      gsap.fromTo(
        cards,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 85%' },
        },
      );
    },
    { scope: containerRef },
  );

  return (
    <section ref={containerRef} className="py-16 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 max-w-xl mx-auto">
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            Funcionalidades
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-text-main mt-2">
            Tudo o que você precisa para vender
          </h2>
          <p className="mt-2 text-text-muted">
            Ferramentas simples para o vendedor de garagem moderno.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="feature-card p-5 rounded-lg bg-surface border border-border"
            >
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 text-primary mb-3 [&_svg]:w-5 [&_svg]:h-5">
                <FontAwesomeIcon icon={feature.icon} />
              </span>
              <h3 className="font-medium text-text-main mb-1">{feature.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
