import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { PageLayout } from '@/components/layout/PageLayout';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <PageLayout showHeader={false} showFooter={false}>
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-8">
                <div className="text-center max-w-md">
                    <h1 className="text-9xl font-extrabold text-primary mb-4 opacity-80">404</h1>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Página Não Encontrada</h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Ops! A página que você está procurando parece ter desaparecido no espaço-tempo.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => navigate('/')}
                        >
                            Voltar ao Início
                        </Button>
                        <Button
                            variant="tertiary"
                            size="lg"
                            onClick={() => navigate(-1)}
                        >
                            Voltar Anterior
                        </Button>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
