import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCookieBite, faXmark } from '@fortawesome/free-solid-svg-icons';
import {
  readCookieConsent,
  saveCookieConsent,
  subscribeCookieConsent,
  subscribeOpenCookiePreferences,
  type ConsentChoice,
} from '@/utils/cookies';

export function CookieBanner() {
  const [visible, setVisible] = useState(() => !readCookieConsent());

  useEffect(() => {
    const unsubConsent = subscribeCookieConsent((consent) => {
      if (consent) setVisible(false);
    });
    const unsubOpen = subscribeOpenCookiePreferences(() => {
      setVisible(true);
    });
    return () => {
      unsubConsent();
      unsubOpen();
    };
  }, []);

  if (!visible || typeof document === 'undefined') return null;

  const handleChoice = (choice: ConsentChoice) => {
    saveCookieConsent(choice);
    setVisible(false);
  };

  return createPortal(
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="cdg-cookie-title"
      className="fixed left-0 right-0 bottom-4 mx-auto z-[9999] w-[min(calc(100vw-24px),660px)] rounded-xl border border-border bg-surface/95 backdrop-blur-md p-4 shadow-xl animate-fade-in-up"
    >
      <div className="grid gap-3">
        <div>
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-primary">
              <FontAwesomeIcon icon={faCookieBite} className="w-4 h-4" aria-hidden="true" />
              <h2 id="cdg-cookie-title" className="text-sm font-semibold text-text-main">
                Sua escolha sobre cookies.
              </h2>
            </div>
            <button
              type="button"
              aria-label="Fechar aviso de cookies"
              onClick={() => handleChoice('essential')}
              className="grid place-items-center w-7 h-7 rounded-md border border-border text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-text-muted">
            Utilizamos cookies e armazenamento local para manter sua sessão segura, lembrar preferências de tema e melhorar o marketplace, em conformidade com a LGPD.{' '}
            <Link to="/cookies" className="text-primary underline underline-offset-2 hover:text-primary-hover">
              Ler política de cookies
            </Link>
            {' · '}
            <Link to="/terms" className="text-primary underline underline-offset-2 hover:text-primary-hover">
              Termos de uso
            </Link>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => handleChoice('rejected')}
            className="min-h-8 px-3.5 py-1.5 rounded-lg border border-border text-xs font-medium text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={() => handleChoice('essential')}
            className="min-h-8 px-3.5 py-1.5 rounded-lg border border-border-strong bg-surface-2 text-xs font-medium text-text-main hover:border-primary hover:text-primary transition-colors cursor-pointer"
          >
            Aceitar o mínimo
          </button>
          <button
            type="button"
            onClick={() => handleChoice('all')}
            className="min-h-8 px-3.5 py-1.5 rounded-lg bg-primary text-xs font-medium text-text-on-primary hover:bg-primary-hover transition-colors cursor-pointer"
          >
            Aceitar todos
          </button>
        </div>
      </div>
    </aside>,
    document.body,
  );
}
