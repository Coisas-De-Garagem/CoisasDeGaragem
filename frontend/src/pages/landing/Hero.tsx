import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faCheck } from '@fortawesome/free-solid-svg-icons';

export function Hero() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const textRef = useRef(null);
  const buttonsRef = useRef(null);
  const imageRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from(titleRef.current, {
      y: 50,
      opacity: 0,
      duration: 1,
      delay: 0.2,
    })
      .from(textRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
      }, '-=0.6')
      .from(buttonsRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.8,
      }, '-=0.6')
      .from(imageRef.current, {
        x: 50,
        opacity: 0,
        duration: 1.2,
        scale: 0.9,
      }, '-=1');
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-secondary-800 text-white min-h-[90vh] flex items-center">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 ref={titleRef} className="text-5xl lg:text-7xl font-bold mb-8 leading-tight tracking-tight">
              A revolução do <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">
                Garage Sale
              </span>
            </h1>
            <p ref={textRef} className="text-xl lg:text-2xl mb-10 text-blue-100/90 leading-relaxed font-light max-w-2xl mx-auto lg:mx-0">
              Transforme itens parados em oportunidades. A plataforma definitiva para organizar, vender e comprar em garage sales com tecnologia QR Code.
            </p>
            <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              <Link to="/auth/register" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full h-14 text-lg shadow-xl shadow-secondary-900/20 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  Começar Agora
                </Button>
              </Link>
              <Link to="/auth/login" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full h-14 text-lg bg-primary-600 hover:bg-primary-700 !text-white border-2 border-primary-500 hover:border-primary-600 shadow-lg shadow-primary-900/20">
                  Acessar Conta
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Content - Modern Illustration */}
          <div ref={imageRef} className="hidden lg:flex justify-end items-center relative perspective-1000">
            <div className="relative w-full max-w-lg aspect-square">
              {/* Floating Elements */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-white/5 rounded-3xl backdrop-blur-md border border-white/10 transform rotate-6 shadow-2xl"></div>
              <div className="absolute inset-0 bg-primary-600/30 rounded-3xl transform -rotate-6 scale-95 blur-sm"></div>

              <div className="absolute inset-4 bg-white/10 rounded-2xl border border-white/20 p-8 flex flex-col justify-between backdrop-blur-xl shadow-inner">
                <div className="space-y-4">
                  <div className="h-4 w-1/3 bg-white/20 rounded-full"></div>
                  <div className="h-32 w-full bg-white/10 rounded-xl border border-white/10 flex items-center justify-center">
                    <FontAwesomeIcon icon={faQrcode} className="w-16 h-16 text-white/50" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-3/4 bg-white/20 rounded-full"></div>
                    <div className="h-3 w-1/2 bg-white/20 rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-white/10 p-4 rounded-xl">
                  <div className="text-sm font-medium">Bicicleta Vintage</div>
                  <div className="text-lg font-bold">R$ 450,00</div>
                </div>
              </div>

              {/* Floating Tag */}
              <div className="absolute -right-8 top-20 bg-white rounded-xl p-4 shadow-xl animate-float-slow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <FontAwesomeIcon icon={faCheck} className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Status</div>
                    <div className="text-sm font-bold text-gray-900">Vendido</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
