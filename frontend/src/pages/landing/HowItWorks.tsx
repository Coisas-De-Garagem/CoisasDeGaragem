import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);

  const steps = [
    { step: '01', title: 'Cadastre-se grátis', description: 'Crie sua conta em segundos. Sem cartão de crédito.' },
    { step: '02', title: 'Adicione produtos', description: 'Foto, preço e o QR code é gerado automaticamente.' },
    { step: '03', title: 'Etiquete tudo', description: 'Imprima e cole os QR codes nos itens.' },
    { step: '04', title: 'Venda rápido', description: 'Compradores escaneiam, pagam e levam na hora.' },
  ];

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>('.step-item');
      items.forEach((item, index) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: index * 0.08,
            scrollTrigger: { trigger: item, start: 'top 88%' },
          },
        );
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      id="como-funciona"
      ref={containerRef}
      className="py-16 bg-surface border-y border-border"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            Como funciona
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-text-main mt-2">
            Simples como deve ser
          </h2>
          <p className="mt-2 text-text-muted">
            Modernize sua venda em 4 passos.
          </p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((item) => (
            <li key={item.step} className="step-item">
              <div className="h-full p-5 rounded-lg border border-border bg-background">
                <span className="block text-2xl font-semibold text-primary mb-2">
                  {item.step}
                </span>
                <h3 className="font-medium text-text-main mb-1">{item.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
