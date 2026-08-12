import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { faShareNodes, faCopy, faCheck, faLink } from '@fortawesome/free-solid-svg-icons';
import { useUIStore } from '@/store/uiStore';

interface ShareButtonProps {
  /** URL completa a ser compartilhada. */
  url: string;
  /** Título curto (usado na Web Share API nativa). */
  title: string;
  /** Mensagem pré-preenchida (vai junto com o link). */
  message: string;
  /** Variante visual do botão. */
  variant?: 'primary' | 'outline' | 'ghost';
  /** Rótulo do botão. */
  label?: string;
  /** Tamanho do botão. */
  size?: 'sm' | 'md';
  /** Ocupa a largura total do contêiner. */
  fullWidth?: boolean;
  className?: string;
}

const VARIANT_CLASSES: Record<string, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  outline: 'bg-transparent text-text-main border border-border-strong hover:bg-surface-hover',
  ghost: 'bg-transparent text-text-muted hover:text-text-main hover:bg-surface-hover',
};

const SIZE_CLASSES: Record<string, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
};

/**
 * Botão de compartilhar link com mensagem.
 *
 * - No mobile usa a Web Share API nativa (navigator.share) quando disponível,
 *   abrindo a folha de compartilhamento do sistema com título + texto + url.
 * - No desktop (sem Web Share) abre um popover com WhatsApp, Telegram e copiar
 *   link, todos com a mensagem pré-preenchida.
 */
export function ShareButton({
  url,
  title,
  message,
  variant = 'outline',
  label = 'Compartilhar',
  size = 'md',
  fullWidth = false,
  className = '',
}: ShareButtonProps) {
  const [showPopover, setShowPopover] = useState(false);
  const [copied, setCopied] = useState(false);
  // Capacidade do navegador de compartilhamento nativo — valor estável, derivado
  // uma única vez no primeiro render (sem precisar de useEffect).
  const [canNativeShare] = useState(
    () => typeof navigator !== 'undefined' && !!navigator.share,
  );
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { addNotification } = useUIStore();

  // Fecha o popover ao clicar fora.
  useEffect(() => {
    if (!showPopover) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowPopover(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopover]);

  // Texto completo (mensagem + quebra + link) usado pelos canais.
  const fullText = `${message}\n${url}`;

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, text: message, url });
    } catch {
      // Usuário cancelou — silencioso.
    }
  };

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(fullText)}`,
      '_blank',
      'noopener,noreferrer',
    );
    setShowPopover(false);
  };

  const handleTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer',
    );
    setShowPopover(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Link copiado!',
        message: 'O link e a mensagem foram copiados para a área de transferência.',
        createdAt: new Date().toISOString(),
        userId: '',
        isRead: false,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erro ao copiar',
        message: 'Não foi possível copiar o link.',
        createdAt: new Date().toISOString(),
        userId: '',
        isRead: false,
      });
    }
    setShowPopover(false);
  };

  const handleClick = () => {
    if (canNativeShare) {
      handleNativeShare();
    } else {
      setShowPopover((v) => !v);
    }
  };

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''} ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        aria-label={label}
        aria-expanded={showPopover}
        className={`inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? 'w-full' : ''}`}
      >
        <FontAwesomeIcon icon={faShareNodes} className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span>{label}</span>
      </button>

      {/* Popover de fallback (desktop) */}
      {showPopover && (
        <div
          ref={popoverRef}
          className="absolute right-0 mt-2 w-64 bg-surface rounded-xl border border-border shadow-lg z-50 animate-scale-in origin-top-right"
          role="menu"
        >
          <div className="p-2 space-y-1">
            <p className="px-3 pt-2 pb-1 text-xs font-medium uppercase tracking-wide text-text-subtle">
              Compartilhar via
            </p>

            <button
              type="button"
              onClick={handleWhatsApp}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-main hover:bg-surface-hover transition-colors text-left"
              role="menuitem"
            >
              <FontAwesomeIcon icon={faWhatsapp} className="w-5 h-5 text-[#25D366]" />
              WhatsApp
            </button>

            <button
              type="button"
              onClick={handleTelegram}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-main hover:bg-surface-hover transition-colors text-left"
              role="menuitem"
            >
              <FontAwesomeIcon icon={faTelegram} className="w-5 h-5 text-[#0088cc]" />
              Telegram
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-main hover:bg-surface-hover transition-colors text-left"
              role="menuitem"
            >
              <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={`w-5 h-5 ${copied ? 'text-success' : 'text-text-muted'}`} />
              {copied ? 'Copiado!' : 'Copiar link com mensagem'}
            </button>
          </div>

          <div className="border-t border-border px-3 py-2.5">
            <p className="text-xs text-text-subtle flex items-center gap-1.5">
              <FontAwesomeIcon icon={faLink} className="w-3 h-3" />
              <span className="truncate">{url}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
