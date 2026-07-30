interface PrivacySection {
  title: string;
  body?: string;
  list?: string[];
}

const sections: PrivacySection[] = [
  {
    title: '1. Coleta de Informações',
    body: 'Coletamos informações que você nos fornece diretamente, como nome, email e dados de produtos. Também coletamos dados de uso automaticamente quando você interage com nossa plataforma.',
  },
  {
    title: '2. Uso das Informações',
    list: [
      'Fornecer e manter nossos serviços;',
      'Processar transações;',
      'Enviar notificações sobre sua conta ou transações;',
      'Melhorar e personalizar nossa plataforma.',
    ],
  },
  {
    title: '3. Compartilhamento de Informações',
    body: 'Não vendemos suas informações pessoais. Compartilhamos dados apenas com prestadores de serviços que nos ajudam a operar a plataforma (ex.: hospedagem, analytics) ou quando exigido por lei.',
  },
  {
    title: '4. Segurança',
    body: 'Empregamos medidas de segurança razoáveis para proteger suas informações. No entanto, nenhum método de transmissão pela internet é 100% seguro.',
  },
  {
    title: '5. Seus Direitos',
    body: 'Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Entre em contato conosco para exercer esses direitos.',
  },
  {
    title: '6. Cookies',
    body: 'Usamos cookies para melhorar sua experiência de navegação e entender como você usa nosso serviço. Você pode controlar o uso de cookies nas configurações do seu navegador.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-text-main tracking-tight mb-2">Política de privacidade</h1>
      <p className="text-sm text-text-muted mb-10">
        Última atualização: {new Date().toLocaleDateString('pt-BR')}
      </p>

      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-base font-semibold text-text-main mb-1.5">{section.title}</h2>
            {section.body && <p className="text-text-muted leading-relaxed text-sm">{section.body}</p>}
            {section.list && (
              <ul className="list-disc pl-5 space-y-1 text-text-muted text-sm">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
