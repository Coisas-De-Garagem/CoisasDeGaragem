import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMobileScreenButton,
  faDownload,
  faCheck,
  faShieldHalved,
  faQrcode,
  faBolt,
  faArrowLeft,
  faCloudArrowDown,
  faGear,
  faCircleCheck,
  faBoxOpen,
} from '@fortawesome/free-solid-svg-icons';
import { faAndroid } from '@fortawesome/free-brands-svg-icons';

export default function MobileDownloadPage() {
  const [downloadTriggered, setDownloadTriggered] = useState(false);
  const [downloadCount, setDownloadCount] = useState(0);

  const apkFileName = 'cdg_app.apk';
  const apkDownloadUrl = `/${apkFileName}`;

  const handleDownload = () => {
    setDownloadTriggered(true);
    setDownloadCount((prev) => prev + 1);

    const link = document.createElement('a');
    link.href = apkDownloadUrl;
    link.download = apkFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dispara o download automaticamente ao carregar a página (após 1.2s para renderizar a UI suavemente)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDownload();
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-[80vh] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Botão Voltar */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-main transition-colors group"
        >
          <span className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center group-hover:border-primary/50 group-hover:text-primary transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
          </span>
          Voltar para o início
        </Link>
      </div>

      {/* Card Principal de Download */}
      <div className="bg-surface border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        {/* Efeito sutil de iluminação no topo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative flex flex-col items-center text-center">
          {/* Ícone Hero do App */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 mb-6 ring-4 ring-primary/10">
            <FontAwesomeIcon
              icon={faMobileScreenButton}
              className="w-10 h-10 sm:w-12 sm:h-12"
            />
          </div>

          {/* Título & Descrição */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-main tracking-tight">
            Baixar aplicativo CoisasDeGaragem
          </h1>
          <p className="mt-3 text-base sm:text-lg text-text-muted max-w-xl leading-relaxed">
            Leve a experiência de garage sales e brechós para o seu celular:
            escaneie QR codes em tempo real, finalize arremates com PIX em
            segundos e acompanhe seus pedidos direto do Android.
          </p>

          {/* Badges de Confiança */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <FontAwesomeIcon icon={faAndroid} className="w-3.5 h-3.5" />
              Android
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <FontAwesomeIcon icon={faBoxOpen} className="w-3.5 h-3.5" />
              APK Oficial
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
              <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 h-3.5" />
              Download Seguro
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface border border-border text-text-muted">
              <FontAwesomeIcon icon={faBolt} className="w-3.5 h-3.5 text-amber-500" />
              v1.0.0
            </span>
          </div>

          {/* Botão de Download Principal */}
          <div className="w-full sm:w-auto min-w-[280px] sm:min-w-[320px] mt-8">
            <button
              onClick={handleDownload}
              type="button"
              className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-base sm:text-lg shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <FontAwesomeIcon icon={faDownload} className="w-5 h-5 animate-bounce" />
              {downloadCount > 0 ? 'Baixar APK Novamente' : 'Baixar APK'}
            </button>
          </div>

          {/* Mensagem de Feedback do Download Automático */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm text-text-muted">
            <FontAwesomeIcon
              icon={downloadTriggered ? faCircleCheck : faCloudArrowDown}
              className={downloadTriggered ? 'text-emerald-500' : 'text-primary animate-pulse'}
            />
            <span>
              {downloadTriggered
                ? 'O download foi iniciado. Se não começou, toque no botão acima.'
                : 'Iniciando download automático do APK...'}
            </span>
          </div>
        </div>

        {/* Recursos do App */}
        <div className="mt-10 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-xl bg-background border border-border/60">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2.5">
              <FontAwesomeIcon icon={faQrcode} className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-text-main text-sm">Leitor QR Code Nativo</h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Câmera otimizada para escanear etiquetas de produtos instantaneamente.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-background border border-border/60">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2.5">
              <FontAwesomeIcon icon={faBolt} className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-text-main text-sm">PIX & Arremate Rápido</h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Pague na hora com cópia e cola ou QR Code sem sair da tela.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-background border border-border/60">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center mb-2.5">
              <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-text-main text-sm">Seguro & Sem Anúncios</h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Aplicativo oficial leve, direto da fonte e sem intermediários.
            </p>
          </div>
        </div>
      </div>

      {/* Guia Passo a Passo: Como Instalar */}
      <div className="mt-8 bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <FontAwesomeIcon icon={faGear} className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-main">Como instalar o APK no Android</h2>
            <p className="text-xs text-text-muted">Siga os 3 passos simples abaixo</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Passo 1 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border/60">
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
              1
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-main flex items-center gap-2">
                <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5 text-primary" />
                Baixe o arquivo APK
              </h4>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                O arquivo <code className="px-1.5 py-0.5 rounded bg-surface border border-border text-primary font-mono text-[11px]">{apkFileName}</code> será salvo na sua pasta de Downloads do celular.
              </p>
            </div>
          </div>

          {/* Passo 2 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border/60">
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
              2
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-main flex items-center gap-2">
                <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 h-3.5 text-primary" />
                Permita a instalação de fontes desconhecidas
              </h4>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Ao abrir o arquivo, se o Android exibir um aviso de segurança, toque em <strong className="text-text-main">Configurações</strong> e ative a opção <strong className="text-text-main">"Permitir desta fonte"</strong> ou <strong className="text-text-main">"Instalar mesmo assim"</strong>.
              </p>
            </div>
          </div>

          {/* Passo 3 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border/60">
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
              3
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-main flex items-center gap-2">
                <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-primary" />
                Abra o aplicativo e aproveite!
              </h4>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Toque em <strong className="text-text-main">Instalar</strong> e, ao concluir, abra o CoisasDeGaragem direto da tela inicial do seu celular.
              </p>
            </div>
          </div>
        </div>

        {/* Informações Técnicas */}
        <div className="mt-6 pt-5 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted">
          <div>
            <span>Arquivo: </span>
            <strong className="text-text-main font-mono">{apkFileName}</strong>
          </div>
          <div>
            <span>Compatibilidade: </span>
            <strong className="text-text-main">Android 8.0+</strong>
          </div>
          <div>
            <span>Tamanho: </span>
            <strong className="text-text-main">~15 MB</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
