import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheck, faCookieBite, faFileLines } from '@fortawesome/free-solid-svg-icons';
import {
  readCookieConsent,
  saveCookieConsent,
  subscribeCookieConsent,
  type ConsentChoice,
  type CookieConsent,
} from '@/utils/cookies';

const statusLabels: Record<ConsentChoice | 'none', string> = {
  none: 'Nenhuma escolha salva ainda.',
  all: 'Todos os cookies permitidos (essenciais, preferências e análise).',
  essential: 'Apenas cookies essenciais ativos (modo mínimo).',
  rejected: 'Cookies opcionais recusados.',
};

const categories = [
  {
    name: 'Essenciais',
    status: 'Sempre ativos',
    description:
      'Necessários para autenticação, segurança da sessão de compradores e vendedores e gravação da sua escolha de consentimento.',
  },
  {
    name: 'Preferências',
    status: 'Opcional',
    description:
      'Guardam preferências de interface, como modo claro ou escuro e filtros utilizados na navegação.',
  },
  {
    name: 'Análise e desempenho',
    status: 'Opcional',
    description:
      'Auxiliam a entender o uso das páginas de eventos e produtos para melhorar a experiência da plataforma.',
  },
];

const inventory = [
  {
    name: 'cdg-cookie-consent-v1',
    category: 'Essencial',
    purpose: 'Armazena localmente sua decisão de consentimento de cookies.',
    duration: 'Persistente até limpeza',
  },
  {
    name: 'cdg_consent',
    category: 'Essencial',
    purpose: 'Cookie técnico de primeiro domínio que registra o nível selecionado (all, essential ou rejected).',
    duration: '180 dias',
  },
  {
    name: 'auth / session',
    category: 'Essencial',
    purpose: 'Mantém a sessão autenticada ativa para vendedores e compradores conectados.',
    duration: 'Sessão / expiração do token',
  },
];

const sections = [
  {
    title: '1. O que são cookies',
    paragraphs: [
      'Cookies são pequenos arquivos de texto salvos pelo navegador durante o uso da plataforma. Tecnologias semelhantes, como o localStorage, cumprem papel equivalente para manter preferências e estado de sessão no dispositivo.',
    ],
  },
  {
    title: '2. Conformidade com a LGPD',
    paragraphs: [
      'O CoisasDeGaragem trata dados técnicos em conformidade com a Lei Geral de Proteção de Dados (Lei n. 13.709/2018), observando finalidade clara, necessidade mínima e transparência.',
      'Você pode alterar sua preferência a qualquer momento nesta página ou pelo link de preferências no rodapé.',
    ],
  },
  {
    title: '3. Gerenciamento no navegador',
    paragraphs: [
      'Além dos controles oferecidos nesta página, você pode bloquear ou limpar cookies diretamente nas configurações do seu navegador.',
    ],
  },
];

export default function CookiesPage() {
  const [consent, setConsent] = useState<CookieConsent | null>(() => readCookieConsent());

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    return subscribeCookieConsent(setConsent);
  }, []);

  const handleChoice = (choice: ConsentChoice) => {
    setConsent(saveCookieConsent(choice));
  };

  const statusText = consent ? statusLabels[consent.choice] : statusLabels.none;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-border mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-primary transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Voltar para o início</span>
        </Link>
        <Link
          to="/terms"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-primary transition-colors"
        >
          <FontAwesomeIcon icon={faFileLines} className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Ler termos de uso</span>
        </Link>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
        Conformidade e transparência
      </p>
      <h1 className="text-3xl font-semibold text-text-main tracking-tight mb-2">
        Política de cookies
      </h1>
      <p className="text-sm text-text-muted leading-relaxed mb-2">
        Esta página explica quais cookies e registros locais o CoisasDeGaragem utiliza, por que eles existem e como você pode aceitar, limitar ao mínimo ou recusar o uso a qualquer momento.
      </p>
      <p className="text-xs text-text-subtle mb-8">Atualizado em novembro de 2026</p>

      <section className="rounded-xl border border-border bg-surface p-5 mb-6">
        <div className="flex items-start gap-3.5 mb-4">
          <div className="grid place-items-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
            <FontAwesomeIcon icon={faCookieBite} className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-main">Sua preferência atual</h2>
            <p className="text-sm text-text-muted mt-0.5">{statusText}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {([
            ['all', 'Aceitar todos'],
            ['essential', 'Aceitar o mínimo'],
            ['rejected', 'Recusar'],
          ] as const).map(([value, label]) => {
            const active = consent?.choice === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleChoice(value)}
                className={`inline-flex items-center gap-1.5 min-h-9 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  active
                    ? 'bg-primary border-primary text-text-on-primary'
                    : 'bg-surface-2 border-border text-text-main hover:border-primary hover:text-primary'
                }`}
              >
                {active && <FontAwesomeIcon icon={faCheck} className="w-3 h-3" aria-hidden="true" />}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-8">
        {categories.map((category) => (
          <article key={category.name} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-baseline justify-between gap-2 mb-1.5">
              <h3 className="text-sm font-semibold text-text-main">{category.name}</h3>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                {category.status}
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">{category.description}</p>
          </article>
        ))}
      </div>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-text-main mb-3">
          Registros utilizados no navegador
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-text-muted uppercase tracking-wide">
                <th className="py-2.5 px-3.5 font-semibold">Identificador</th>
                <th className="py-2.5 px-3.5 font-semibold">Categoria</th>
                <th className="py-2.5 px-3.5 font-semibold">Finalidade</th>
                <th className="py-2.5 px-3.5 font-semibold">Duração</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.name} className="border-b border-border last:border-b-0">
                  <td className="py-2.5 px-3.5 font-mono text-text-main">{item.name}</td>
                  <td className="py-2.5 px-3.5 text-text-muted">{item.category}</td>
                  <td className="py-2.5 px-3.5 text-text-muted">{item.purpose}</td>
                  <td className="py-2.5 px-3.5 text-text-muted">{item.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title} className="pt-5 border-t border-border">
            <h2 className="text-base font-semibold text-text-main mb-1.5">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-sm text-text-muted leading-relaxed mt-1.5 first:mt-0">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
