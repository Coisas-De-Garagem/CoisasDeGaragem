import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function HowItWorks() {
  const containerRef = useRef(null);

  const steps = [
    {
      step: '01',
      title: 'Cadastre-se Grátis',
      description: 'Crie sua conta em segundos. Sem cartão de crédito, sem taxas escondidas.',
    },
    {
      step: '02',
      title: 'Adicione Produtos',
      description: 'Tire uma foto, defina o preço e nós geramos o QR Code automaticamente.',
    },
    {
      step: '03',
      title: 'Etiquete Tudo',
      description: 'Imprima e cole os QR Codes nos itens da sua garagem.',
    },
    {
      step: '04',
      title: 'Venda Rápido',
      description: 'Compradores escaneiam, pagam e você recebe na hora.',
    },
  ];

  useGSAP(() => {
    const items = gsap.utils.toArray('.step-item');
    items.forEach((item: any, index) => {
      gsap.fromTo(item,
        { opacity: 0, x: index % 2 === 0 ? -50 : 50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          scrollTrigger: {
            trigger: item,
            start: 'top 80%',
          }
        }
      );
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-24 bg-gray-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Simples como deve ser
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Esqueça as planilhas e o caderno de anotações. Modernize sua venda em 4 passos.
          </p>
        </div>

        <div className="relative">
          {/* Connector Line */}
          {/* Connector Line - Removed */}
          {/* <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-800 -translate-x-1/2 hidden md:block" /> */}

          <div className="space-y-12 md:space-y-24">
            {steps.map((item, index) => (
              <div key={index} className={`step-item flex flex-col md:flex-row items-center gap-8 md:gap-16 ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                {/* Number */}
                <div className="flex-1 flex justify-center md:justify-end">
                  <div className={`w-32 h-32 rounded-full border-4 border-gray-800 flex items-center justify-center bg-gray-900 z-10 ${index % 2 === 0 ? 'md:mr-[-64px]' : 'md:ml-[-64px]'} `}>
                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-indigo-500">
                      {item.step}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className={`${index % 2 !== 0 ? 'md:text-right' : ''}`}>
                    <h3 className="text-2xl font-bold mb-3 text-white">{item.title}</h3>
                    <p className="text-gray-400 text-lg leading-relaxed">{item.description}</p>
                  </div>
                </div>

                {/* Spacer for Flex Alignment */}
                <div className="flex-1 hidden md:block"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
