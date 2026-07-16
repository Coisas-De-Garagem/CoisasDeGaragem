import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faCircleQuestion, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/common/Button';

interface Faq {
  question: string;
  answer: string;
}

const faqs: Faq[] = [
  {
    question: 'O que é o CoisasDeGaragem?',
    answer:
      'É uma plataforma que facilita a organização e realização de vendas de garagem (garage sales), permitindo cadastrar produtos, gerar etiquetas com QR codes e gerenciar vendas de forma digital.',
  },
  {
    question: 'Preciso pagar para usar?',
    answer:
      'Atualmente a plataforma é gratuita para uso pessoal. Cobramos apenas uma pequena taxa sobre transações realizadas através de pagamentos digitais integrados (em breve).',
  },
  {
    question: 'Como funciona o QR code?',
    answer:
      'Cada produto cadastrado gera um QR code único. O vendedor pode imprimir e colar no produto. O comprador escaneia o código com a câmera do celular para ver detalhes e comprar.',
  },
  {
    question: 'Posso vender qualquer coisa?',
    answer:
      'Você pode vender a maioria dos itens domésticos usados, desde que sejam legais e seguros. Itens proibidos incluem armas, substâncias controladas e produtos falsificados. Consulte nossos Termos de Uso.',
  },
  {
    question: 'Como recebo meu dinheiro?',
    answer:
      'Você pode combinar o pagamento diretamente com o comprador (dinheiro, PIX pessoal) ou usar nossa integração de pagamentos para receber em sua conta.',
  },
];

function FaqItem({ faq }: { faq: Faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-medium text-text-main text-sm">{faq.question}</span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`w-4 h-4 flex-shrink-0 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <p className="pb-4 text-text-muted leading-relaxed text-sm">{faq.answer}</p>}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-primary/10 text-primary mb-4 [&_svg]:w-6 [&_svg]:h-6">
          <FontAwesomeIcon icon={faCircleQuestion} />
        </span>
        <h1 className="text-3xl font-semibold text-text-main tracking-tight">Central de ajuda</h1>
        <p className="mt-2 text-text-muted">
          Perguntas frequentes para você aproveitar ao máximo.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg px-5">
        {faqs.map((faq) => (
          <FaqItem key={faq.question} faq={faq} />
        ))}
      </div>

      <div className="mt-8 p-5 rounded-lg bg-surface border border-border text-center">
        <h2 className="font-medium text-text-main">Ainda tem dúvidas?</h2>
        <p className="mt-1 text-sm text-text-muted mb-4">
          Nossa equipe está pronta para ajudar.
        </p>
        <Link to="/contact">
          <Button variant="primary" leftIcon={<FontAwesomeIcon icon={faEnvelope} />}>
            Fale conosco
          </Button>
        </Link>
      </div>
    </div>
  );
}
