import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faArrowsRotate, faHouse } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/common/Button';

export default function ServerErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-14 h-14 rounded-full bg-error/10 text-error flex items-center justify-center mb-6 [&_svg]:w-7 [&_svg]:h-7">
        <FontAwesomeIcon icon={faTriangleExclamation} />
      </div>
      <p className="text-6xl font-bold text-error mb-2 tracking-tight">500</p>
      <h1 className="text-xl font-semibold text-text-main mb-2">Erro no servidor</h1>
      <p className="text-text-muted max-w-sm mb-8">
        Algo deu errado do nosso lado. Tente novamente em instantes.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          onClick={() => navigate('/')}
          leftIcon={<FontAwesomeIcon icon={faHouse} />}
        >
          Voltar ao início
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          leftIcon={<FontAwesomeIcon icon={faArrowsRotate} />}
        >
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
