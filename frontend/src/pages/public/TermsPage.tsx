import { PageLayout } from '@/components/layout/PageLayout';

export default function TermsPage() {
    return (
        <PageLayout>
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Termos de Uso</h1>

                <div className="prose prose-blue text-gray-500">
                    <p>Última atualização: {new Date().toLocaleDateString()}</p>

                    <h3>1. Aceitação dos Termos</h3>
                    <p>
                        Ao acessar e usar o CoisasDeGaragem, você concorda em cumprir e estar vinculado a estes Termos de Uso.
                        Se você não concordar com qualquer parte destes termos, não poderá usar nossos serviços.
                    </p>

                    <h3>2. Descrição do Serviço</h3>
                    <p>
                        O CoisasDeGaragem é uma plataforma que conecta vendedores e compradores para vendas de garagem presenciais.
                        Nós fornecemos ferramentas digitais (catálogo, QR Codes) para facilitar essas transações.
                    </p>

                    <h3>3. Responsabilidades do Usuário</h3>
                    <p>
                        Você é responsável por manter a segurança de sua conta e por todas as atividades que ocorram nela.
                        Você concorda em não usar o serviço para qualquer finalidade ilegal ou não autorizada.
                    </p>

                    <h3>4. Conteúdo do Usuário</h3>
                    <p>
                        Ao postar conteúdo (fotos de produtos, descrições), você garante que possui os direitos sobre esse conteúdo
                        e que ele não viola direitos de terceiros. Nós nos reservamos o direito de remover qualquer conteúdo que
                        viole estes termos.
                    </p>

                    <h3>5. Isenção de Responsabilidade</h3>
                    <p>
                        O CoisasDeGaragem não é parte das transações entre compradores e vendedores. Não garantimos a qualidade,
                        segurança ou legalidade dos itens anunciados, nem a veracidade ou precisão dos anúncios.
                    </p>

                    <h3>6. Alterações nos Termos</h3>
                    <p>
                        Podemos modificar estes termos a qualquer momento. O uso continuado da plataforma após as alterações
                        constitui aceitação dos novos termos.
                    </p>
                </div>
            </div>
        </PageLayout>
    );
}
