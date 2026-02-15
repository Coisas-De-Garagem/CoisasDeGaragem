import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faChartBar, faMobileAlt, faSmile, faClock, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

gsap.registerPlugin(ScrollTrigger);

export function Features() {
  const containerRef = useRef(null);

  const features = [
    {
      icon: <FontAwesomeIcon icon={faQrcode} className="w-6 h-6" />,
      title: 'QR Codes Únicos',
      description: 'Cada produto recebe um código exclusivo. Cole, escaneie e venda instantaneamente.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: <FontAwesomeIcon icon={faChartBar} className="w-6 h-6" />,
      title: 'Analytics em Tempo Real',
      description: 'Acompanhe suas vendas, receita e itens mais populares enquanto acontecem.',
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      icon: <FontAwesomeIcon icon={faMobileAlt} className="w-6 h-6" />,
      title: '100% Mobile First',
      description: 'Interface otimizada para qualquer dispositivo. Gerencie tudo do seu celular.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: <FontAwesomeIcon icon={faSmile} className="w-6 h-6" />,
      title: 'Simples e Intuitivo',
      description: 'Sem configurações complexas. Cadastre, imprima e comece a vender.',
      color: 'bg-teal-100 text-teal-600'
    },
    {
      icon: <FontAwesomeIcon icon={faClock} className="w-6 h-6" />,
      title: 'Economize Tempo',
      description: 'Automatize o processo de vendas e evite filas e cálculos manuais.',
      color: 'bg-rose-100 text-rose-600'
    },
    {
      icon: <FontAwesomeIcon icon={faShieldAlt} className="w-6 h-6" />,
      title: 'Segurança Total',
      description: 'Transações seguras e dados protegidos para você e seus clientes.',
      color: 'bg-emerald-100 text-emerald-600'
    },
  ];

  useGSAP(() => {
    const cards = gsap.utils.toArray('.feature-card');

    gsap.fromTo(cards,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        }
      }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-2">
            Funcionalidades
          </h2>
          <h3 className="text-4xl font-bold text-gray-900 mb-6">
            Tudo o que você precisa para vender mais
          </h3>
          <p className="text-xl text-gray-500">
            Ferramentas profissionais simplificadas para o vendedor de garagem moderno.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card group p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
