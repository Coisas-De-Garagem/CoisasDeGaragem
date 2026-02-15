import { PageLayout } from '@/components/layout/PageLayout';

export default function AboutPage() {
    return (
        <PageLayout>
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        Sobre o CoisasDeGaragem
                    </h1>
                    <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                        Reinventando a experiência de vendas de garagem com tecnologia e comunidade.
                    </p>
                </div>

                <div className="prose prose-lg text-gray-500 mx-auto">
                    <p>
                        O <strong>CoisasDeGaragem</strong> nasceu da necessidade de modernizar as tradicionais vendas de garagem.
                        Nossa missão é conectar vizinhos e comunidades, facilitando a compra e venda de itens usados de forma
                        segura, rápida e organizada.
                    </p>

                    <h3>Nossa História</h3>
                    <p>
                        Tudo começou quando percebemos que organizar uma venda de garagem era trabalhoso: etiquetar preços,
                        controlar o caixa, divulgar para os vizinhos. Decidimos criar uma plataforma que resolvesse esses problemas
                        usando tecnologia simples e acessível: o QR Code.
                    </p>

                    <h3>Como Funciona</h3>
                    <p>
                        Diferente de marketplaces online tradicionais, focamos na experiência presencial. O vendedor cadastra
                        seus itens, gera etiquetas com QR Code, e no dia da venda, tudo acontece de forma fluida. O comprador
                        escaneia, paga e leva o produto. Sem confusão, sem troco, sem planilhas de papel.
                    </p>

                    <h3>Nossos Valores</h3>
                    <ul>
                        <li><strong>Sustentabilidade:</strong> Acreditamos em dar uma segunda vida aos objetos.</li>
                        <li><strong>Comunidade:</strong> Fortalecemos laços locais através do comércio de vizinhança.</li>
                        <li><strong>Simplicidade:</strong> Tecnologia deve facilitar, não complicar.</li>
                        <li><strong>Transparência:</strong> Saber o que você está comprando e de quem.</li>
                    </ul>
                </div>
            </div>
        </PageLayout>
    );
}
