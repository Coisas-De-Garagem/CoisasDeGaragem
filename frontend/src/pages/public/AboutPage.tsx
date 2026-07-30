import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faUsers, faWandMagicSparkles, faEye } from '@fortawesome/free-solid-svg-icons';

const values = [
  { icon: faLeaf, title: 'Sustentabilidade', text: 'Acreditamos em dar uma segunda vida aos objetos.' },
  { icon: faUsers, title: 'Comunidade', text: 'Fortalecemos laços locais através do comércio de vizinhança.' },
  { icon: faWandMagicSparkles, title: 'Simplicidade', text: 'Tecnologia deve facilitar, não complicar.' },
  { icon: faEye, title: 'Transparência', text: 'Saber o que você está comprando e de quem.' },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-text-main tracking-tight">
          Sobre o CoisasDeGaragem
        </h1>
        <p className="mt-2 text-lg text-text-muted">
          Reinventando a experiência de vendas de garagem com tecnologia e comunidade.
        </p>
      </div>

      <div className="space-y-6 text-text-muted leading-relaxed">
        <p>
          O <strong className="text-text-main">CoisasDeGaragem</strong> nasceu da necessidade de
          modernizar as tradicionais vendas de garagem. Nossa missão é conectar vizinhos e
          comunidades, facilitando a compra e venda de itens usados de forma segura, rápida e
          organizada.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-text-main mb-2">Nossa história</h2>
          <p>
            Tudo começou quando percebemos que organizar uma venda de garagem era trabalhoso:
            etiquetar preços, controlar o caixa, divulgar para os vizinhos. Decidimos criar uma
            plataforma que resolvesse esses problemas usando tecnologia simples e acessível: o QR code.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-main mb-2">Como funciona</h2>
          <p>
            Diferente de marketplaces online tradicionais, focamos na experiência presencial. O
            vendedor cadastra seus itens, gera etiquetas com QR code, e no dia da venda tudo acontece
            de forma fluida. O comprador escaneia, paga e leva o produto.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-main mb-4">Nossos valores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {values.map((value) => (
              <div key={value.title} className="p-4 rounded-lg bg-surface border border-border">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 text-primary mb-3 [&_svg]:w-4 [&_svg]:h-4">
                  <FontAwesomeIcon icon={value.icon} />
                </span>
                <h3 className="font-medium text-text-main text-sm">{value.title}</h3>
                <p className="text-sm text-text-muted mt-1">{value.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
