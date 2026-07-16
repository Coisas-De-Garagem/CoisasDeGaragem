import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faArrowLeft, faHouse } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/common/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 [&_svg]:w-7 [&_svg]:h-7">
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </div>
      <p className="text-6xl font-bold text-primary mb-2 tracking-tight">404</p>
      <h1 className="text-xl font-semibold text-text-main mb-2">Página não encontrada</h1>
      <p className="text-text-muted max-w-sm mb-8">
        A página que você procura não existe ou foi movida.
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
          onClick={() => navigate(-1)}
          leftIcon={<FontAwesomeIcon icon={faArrowLeft} />}
        >
          Página anterior
        </Button>
      </div>
    </div>
  );
}
