import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              CoisasDeGaragem
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              A plataforma completa para gerenciar suas vendas em garage sales com QR codes.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Navegação</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/auth/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                  Entrar
                </Link>
              </li>
              <li>
                <Link to="/auth/register" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                  Cadastrar
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Suporte & Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                  Fale Conosco
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} CoisasDeGaragem. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
