import { PageLayout } from '@/components/layout/PageLayout';

export default function HelpPage() {
    const faqs = [
        {
            question: 'O que é o CoisasDeGaragem?',
            answer: 'É uma plataforma que facilita a organização e realização de vendas de garagem (garage sales), permitindo cadastrar produtos, gerar etiquetas com QR Codes e gerenciar vendas de forma digital.'
        },
        {
            question: 'Preciso pagar para usar?',
            answer: 'Atualmente a plataforma é gratuita para uso pessoal. Cobramos apenas uma pequena taxa sobre transações realizadas através de pagamentos digitais integrados (em breve).'
        },
        {
            question: 'Como funciona o QR Code?',
            answer: 'Cada produto cadastrado gera um QR Code único. O vendedor pode imprimir e colar no produto. O comprador escaneia o código com a câmera do celular (ou direto no app) para ver detalhes e comprar.'
        },
        {
            question: 'Posso vender qualquer coisa?',
            answer: 'Você pode vender a maioria dos itens domésticos usados, desde que sejam legais e seguros. Itens proibidos incluem armas, substâncias controladas e produtos falsificados. Consulte nossos Termos de Uso.'
        },
        {
            question: 'Como recebo meu dinheiro?',
            answer: 'Você pode combinar o pagamento diretamente com o comprador (dinheiro, Pix pessoal) ou usar nossa integração futura de pagamentos para receber tudo em sua conta bancária de forma centralizada.'
        },
    ];

    return (
        <PageLayout>
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Central de Ajuda
                    </h1>
                    <p className="mt-4 text-lg text-gray-500">
                        Perguntas frequentes e guias para você aproveitar ao máximo.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto divide-y divide-gray-200">
                    {faqs.map((faq, index) => (
                        <div key={index} className="py-6">
                            <dt className="text-lg leading-6 font-medium text-gray-900">
                                {faq.question}
                            </dt>
                            <dd className="mt-2 text-base text-gray-500">
                                {faq.answer}
                            </dd>
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-gray-50 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-medium text-gray-900">Ainda tem dúvidas?</h3>
                    <p className="mt-2 text-gray-500 mb-6">
                        Nossa equipe está pronta para ajudar você com qualquer problema.
                    </p>
                    <a
                        href="/contact"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover transition-colors"
                    >
                        Fale Conosco
                    </a>
                </div>
            </div>
        </PageLayout>
    );
}
