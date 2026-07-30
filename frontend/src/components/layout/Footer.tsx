import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <Logo className="w-7 h-7" />
              <span className="font-display font-semibold text-text-main text-sm">
                Coisas<span className="text-primary">DeGaragem</span>
              </span>
            </Link>
            <p className="text-xs text-text-muted max-w-xs">
              O marketplace das garage sales. Compre e venda peças únicas perto de você.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-text-main mb-3 uppercase tracking-wide">Plataforma</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-text-muted hover:text-primary">Início</Link></li>
              <li><Link to="/about" className="text-sm text-text-muted hover:text-primary">Sobre</Link></li>
              <li><Link to="/auth/register" className="text-sm text-text-muted hover:text-primary">Cadastrar</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-text-main mb-3 uppercase tracking-wide">Suporte</h4>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-sm text-text-muted hover:text-primary">Ajuda</Link></li>
              <li><Link to="/contact" className="text-sm text-text-muted hover:text-primary">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-text-main mb-3 uppercase tracking-wide">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-sm text-text-muted hover:text-primary">Termos</Link></li>
              <li><Link to="/privacy" className="text-sm text-text-muted hover:text-primary">Privacidade</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-center text-xs text-text-subtle">
            © {year} CoisasDeGaragem
          </p>
        </div>
      </div>
    </footer>
  );
}
