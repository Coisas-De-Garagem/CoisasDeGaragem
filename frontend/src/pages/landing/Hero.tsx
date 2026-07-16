import { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/common/Button';
import { BackgroundScene } from '@/components/layout/BackgroundScene';

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from(titleRef.current, { y: 24, opacity: 0, duration: 0.6, delay: 0.1 })
        .from(textRef.current, { y: 16, opacity: 0, duration: 0.6 }, '-=0.4')
        .from(buttonsRef.current, { y: 12, opacity: 0, duration: 0.5 }, '-=0.4');
    },
    { scope: containerRef },
  );

  return (
    <section ref={containerRef} className="relative isolate overflow-hidden bg-background">
      {/* Imagem de fundo (amanhecer) */}
      <div className="absolute inset-0 -z-10">
        <BackgroundScene className="w-full h-full object-cover" />
        {/* Esmaece no topo e na base para fundir com o fundo da página.
            No modo escuro o overlay é mais forte para manter o texto legível. */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background dark:via-background/70" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-12 sm:pt-24 sm:pb-16 text-center">
        <span className="inline-flex items-center gap-2 text-xs font-medium bg-surface/90 backdrop-blur text-primary px-3 py-1 rounded-full mb-5">
          <FontAwesomeIcon icon={faQrcode} className="w-3.5 h-3.5" />
          O seu Marketplace de garage sales
        </span>

        <h1
          ref={titleRef}
          className="text-4xl sm:text-5xl font-semibold text-text-main leading-tight tracking-tight"
        >
          Compre e venda peças únicas<br />em garage sales perto de você
        </h1>

        <p
          ref={textRef}
          className="mt-5 text-lg text-text-main/80 leading-relaxed max-w-xl mx-auto"
        >
          Anuncie seus produtos, gere QR codes e venda na hora. Compre escaneando
          e pague com PIX, cartão ou dinheiro.
        </p>

        <div ref={buttonsRef} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/auth/register">
            <Button variant="primary" size="lg" rightIcon={<FontAwesomeIcon icon={faArrowRight} />}>
              Começar agora
            </Button>
          </Link>
          <Link to="/auth/login">
            <Button variant="outline" size="lg" className="bg-surface/90 backdrop-blur">
              Já tenho conta
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
