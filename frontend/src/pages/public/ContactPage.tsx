import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 1500);
    };

    return (
        <PageLayout>
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Entre em Contato
                        </h1>
                        <p className="mt-4 text-lg text-gray-500">
                            Dúvidas, sugestões ou precisa de ajuda? Estamos aqui para ouvir você.
                        </p>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        {isSuccess ? (
                            <div className="p-8 text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                    <FontAwesomeIcon icon={faCheck} className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Mensagem enviada!</h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Agradecemos seu contato. Nossa equipe responderá em breve.
                                </p>
                                <div className="mt-6">
                                    <Button onClick={() => setIsSuccess(false)} variant="secondary">
                                        Enviar nova mensagem
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
                                        <div className="mt-1">
                                            <Input
                                                type="text"
                                                name="name"
                                                id="name"
                                                required
                                                placeholder="Seu nome"
                                                fullWidth
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                        <div className="mt-1">
                                            <Input
                                                type="email"
                                                name="email"
                                                id="email"
                                                required
                                                placeholder="seu@email.com"
                                                fullWidth
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Assunto</label>
                                    <div className="mt-1">
                                        <Input
                                            type="text"
                                            name="subject"
                                            id="subject"
                                            required
                                            placeholder="Como podemos ajudar?"
                                            fullWidth
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mensagem</label>
                                    <div className="mt-1">
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows={4}
                                            className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                            required
                                            placeholder="Descreva sua dúvida ou sugestão..."
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" isLoading={isSubmitting} size="lg">
                                        Enviar Mensagem
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>

                    <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="bg-gray-50 rounded-lg p-6 text-center">
                            <h3 className="text-lg font-medium text-gray-900">Suporte Técnico</h3>
                            <p className="mt-2 text-base text-gray-500">
                                Problemas com a plataforma?
                            </p>
                            <a href="mailto:support@coisasdegaragem.com" className="mt-4 inline-flex items-center text-primary hover:text-primary-dark">
                                support@coisasdegaragem.com
                            </a>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-6 text-center">
                            <h3 className="text-lg font-medium text-gray-900">Parcerias</h3>
                            <p className="mt-2 text-base text-gray-500">
                                Quer levar o CoisasDeGaragem para seu evento?
                            </p>
                            <a href="mailto:partners@coisasdegaragem.com" className="mt-4 inline-flex items-center text-primary hover:text-primary-dark">
                                partners@coisasdegaragem.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
