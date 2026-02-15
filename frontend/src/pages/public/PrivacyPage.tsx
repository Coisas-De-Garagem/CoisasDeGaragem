import { PageLayout } from '@/components/layout/PageLayout';

export default function PrivacyPage() {
    return (
        <PageLayout>
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Política de Privacidade</h1>

                <div className="prose prose-blue text-gray-500">
                    <p>Última atualização: {new Date().toLocaleDateString()}</p>

                    <h3>1. Coleta de Informações</h3>
                    <p>
                        Coletamos informações que você nos fornece diretamente, como nome, email e dados de produtos.
                        Também coletamos dados de uso automaticamente quando você interage com nossa plataforma.
                    </p>

                    <h3>2. Uso das Informações</h3>
                    <p>
                        Usamos suas informações para:
                        <ul>
                            <li>Fornecer e manter nossos serviços;</li>
                            <li>Processar transações;</li>
                            <li>Enviar notificações sobre sua conta ou transações;</li>
                            <li>Melhorar e personalizar nossa plataforma.</li>
                        </ul>
                    </p>

                    <h3>3. Compartilhamento de Informações</h3>
                    <p>
                        Não vendemos suas informações pessoais. Compartilhamos dados apenas com prestadores de serviços
                        que nos ajudam a operar a plataforma (ex: hospedagem, analytics) ou quando exigido por lei.
                    </p>

                    <h3>4. Segurança</h3>
                    <p>
                        Empregamos medidas de segurança razoáveis para proteger suas informações. No entanto, nenhum método
                        de transmissão pela internet é 100% seguro.
                    </p>

                    <h3>5. Seus Direitos</h3>
                    <p>
                        Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Entre em contato conosco
                        para exercer esses direitos.
                    </p>

                    <h3>6. Cookies</h3>
                    <p>
                        Usamos cookies para melhorar sua experiência de navegação e entender como você usa nosso serviço.
                        Você pode controlar o uso de cookies nas configurações do seu navegador.
                    </p>
                </div>
            </div>
        </PageLayout>
    );
}
