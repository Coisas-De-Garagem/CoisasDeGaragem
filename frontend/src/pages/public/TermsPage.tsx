const sections = [
  {
    title: '1. Aceitação dos Termos',
    body: 'Ao acessar e usar o CoisasDeGaragem, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não poderá usar nossos serviços.',
  },
  {
    title: '2. Descrição do Serviço',
    body: 'O CoisasDeGaragem é uma plataforma que conecta vendedores e compradores para vendas de garagem presenciais. Fornecemos ferramentas digitais (catálogo, QR codes) para facilitar essas transações.',
  },
  {
    title: '3. Responsabilidades do Usuário',
    body: 'Você é responsável por manter a segurança de sua conta e por todas as atividades que ocorram nela. Você concorda em não usar o serviço para qualquer finalidade ilegal ou não autorizada.',
  },
  {
    title: '4. Conteúdo do Usuário',
    body: 'Ao postar conteúdo (fotos de produtos, descrições), você garante que possui os direitos sobre esse conteúdo e que ele não viola direitos de terceiros. Reservamo-nos o direito de remover qualquer conteúdo que viole estes termos.',
  },
  {
    title: '5. Isenção de Responsabilidade',
    body: 'O CoisasDeGaragem não é parte das transações entre compradores e vendedores. Não garantimos a qualidade, segurança ou legalidade dos itens anunciados, nem a veracidade ou precisão dos anúncios.',
  },
  {
    title: '6. Alterações nos Termos',
    body: 'Podemos modificar estes termos a qualquer momento. O uso continuado da plataforma após as alterações constitui aceitação dos novos termos.',
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-text-main tracking-tight mb-2">Termos de uso</h1>
      <p className="text-sm text-text-muted mb-10">
        Última atualização: {new Date().toLocaleDateString('pt-BR')}
      </p>

      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-base font-semibold text-text-main mb-1.5">{section.title}</h2>
            <p className="text-text-muted leading-relaxed text-sm">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
