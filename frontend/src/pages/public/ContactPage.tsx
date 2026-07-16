import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faEnvelope, faLifeRing, faHandshake } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Card } from '@/components/common/Card';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-text-main tracking-tight">Entre em contato</h1>
        <p className="mt-2 text-text-muted">
          Dúvidas, sugestões ou precisa de ajuda? Estamos aqui para ouvir você.
        </p>
      </div>

      <Card>
        {isSuccess ? (
          <div className="p-8 text-center">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/15 text-success mb-4 [&_svg]:w-6 [&_svg]:h-6">
              <FontAwesomeIcon icon={faCircleCheck} />
            </span>
            <h2 className="text-base font-semibold text-text-main">Mensagem enviada!</h2>
            <p className="mt-1 text-sm text-text-muted">
              Agradecemos seu contato. Nossa equipe responderá em breve.
            </p>
            <Button variant="outline" className="mt-5" onClick={() => setIsSuccess(false)}>
              Enviar nova mensagem
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input id="name" name="name" type="text" label="Nome" placeholder="Seu nome" required />
              <Input id="email" name="email" type="email" label="Email" placeholder="seu@email.com" required />
            </div>
            <Input id="subject" name="subject" type="text" label="Assunto" placeholder="Como podemos ajudar?" required />
            <Textarea id="message" name="message" label="Mensagem" rows={5} placeholder="Descreva sua dúvida ou sugestão..." required />
            <div className="flex justify-end">
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Enviar mensagem
              </Button>
            </div>
          </form>
        )}
      </Card>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card>
          <div className="p-4">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 text-primary [&_svg]:w-4 [&_svg]:h-4">
                <FontAwesomeIcon icon={faLifeRing} />
              </span>
              <h3 className="font-medium text-text-main text-sm">Suporte técnico</h3>
            </div>
            <a
              href="mailto:support@coisasdegaragem.com"
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <FontAwesomeIcon icon={faEnvelope} className="w-3.5 h-3.5" />
              support@coisasdegaragem.com
            </a>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-accent/15 text-accent-600 [&_svg]:w-4 [&_svg]:h-4">
                <FontAwesomeIcon icon={faHandshake} />
              </span>
              <h3 className="font-medium text-text-main text-sm">Parcerias</h3>
            </div>
            <a
              href="mailto:partners@coisasdegaragem.com"
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <FontAwesomeIcon icon={faEnvelope} className="w-3.5 h-3.5" />
              partners@coisasdegaragem.com
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
