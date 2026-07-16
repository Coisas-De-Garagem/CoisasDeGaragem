import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQrcode,
  faTag,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { Logo } from '@/components/layout/Logo';
import { BackgroundScene } from '@/components/layout/BackgroundScene';
import { DarkModeToggle } from '@/components/common/DarkModeToggle';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Layout das telas de autenticação.
 * - Desktop: painel lateral com resumo dos benefícios + formulário.
 * - Mobile: formulário em tela cheia.
 * Fundo: cena de amanhecer esmaecida, fundindo com a página.
 */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const benefits = [
    { icon: faQrcode, text: 'Compre escaneando um QR code' },
    { icon: faTag, text: 'Anuncie seus produtos em segundos' },
    { icon: faShieldHalved, text: 'Pagamento via PIX ou cartão' },
  ];

  return (
    <div className="relative min-h-screen flex bg-background overflow-hidden">
      {/* Imagem de fundo */}
      <div className="absolute inset-0 z-0">
        <BackgroundScene className="w-full h-full object-cover" />
        {/* Esmaece nas bordas para fundir com o fundo. Overlay mais forte no dark. */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/40 dark:via-background/80 dark:to-background/55" />
      </div>

      {/* Painel lateral (desktop) */}
      <aside className="hidden lg:flex lg:w-1/2 bg-surface/70 backdrop-blur-sm border-r border-border p-12 flex-col justify-between relative z-10">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="h-8 w-auto" />
          <span className="font-display font-semibold text-text-main">
            Coisas<span className="text-primary">DeGaragem</span>
          </span>
        </Link>

        <div>
          <h2 className="text-3xl font-semibold text-text-main leading-tight mb-4">
            Compre e venda em<br />garage sales perto de você
          </h2>
          <p className="text-text-muted max-w-md mb-8">
            O marketplace das peças únicas. Escaneie, negocie e leve para casa
            itens incríveis com segurança.
          </p>
          <ul className="space-y-3">
            {benefits.map((item) => (
              <li key={item.text} className="flex items-center gap-3">
                <span className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 text-primary [&_svg]:w-4 [&_svg]:h-4">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <span className="text-text-main text-sm">{item.text}</span>
              </li>
            ))}
          </ul>

          {/* Exemplo de Card de Produto com QR Code */}
          <div className="mt-10 p-5 rounded-xl bg-surface border border-border shadow-sm flex items-center gap-5 max-w-sm">
            <div className="w-24 h-24 bg-surface-hover rounded-lg flex items-center justify-center p-2 border border-border/50 shrink-0">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://coisasdegaragem.com.br&color=333333&bgcolor=ffffff" 
                alt="QR Code" 
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            <div className="flex-1">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 block">Exemplo</span>
              <h3 className="font-medium text-text-main text-base leading-tight">Máquina de Escrever Vintage</h3>
              <p className="text-sm text-text-muted mt-1 mb-2">Perfeito estado.</p>
              <div className="font-bold text-lg text-text-main">R$ 250,00</div>
            </div>
          </div>
        </div>

        <p className="text-xs text-text-subtle">© {new Date().getFullYear()} CoisasDeGaragem</p>
      </aside>

      {/* Formulário */}
      <main className="flex-1 flex flex-col relative z-10">
        <div className="flex items-center justify-end p-4">
          <DarkModeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-8">
          <div className="w-full max-w-sm bg-surface/85 backdrop-blur-sm border border-border rounded-xl p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-text-main">{title}</h1>
              <p className="text-text-muted mt-1 text-sm">{subtitle}</p>
            </div>

            {children}

            {footer && <div className="mt-6 text-center text-sm text-text-muted">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
