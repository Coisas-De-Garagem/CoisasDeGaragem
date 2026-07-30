import { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/library';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQrcode,
  faTriangleExclamation,
  faCamera,
  faKeyboard,
} from '@fortawesome/free-solid-svg-icons';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { api } from '@/services/api';
import type { Product, User } from '@/types';

interface QRScannerProps {
  onScanSuccess: (product: Product, seller: User) => void;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setHasPermission(true);
      stream.getTracks().forEach((track) => track.stop());
      setIsCameraActive(true);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Permissão de câmera negada. Permita o acesso nas configurações do navegador.');
        } else if (err.name === 'NotFoundError') {
          setError('Nenhuma câmera encontrada neste dispositivo.');
        } else {
          setError(`Erro ao acessar câmera: ${err.message}`);
        }
      } else {
        setError('Erro ao acessar câmera. Tente novamente.');
      }
      setHasPermission(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkCameraPermission();
    return () => {
      codeReaderRef.current?.reset();
    };
  }, []);

  const handleScan = async (scannedText: string) => {
    setIsScanning(true);
    setError('');

    let qrCode = scannedText;
    if (scannedText.includes('/product/')) {
      const parts = scannedText.split('/product/');
      qrCode = parts[parts.length - 1].split('?')[0].split('#')[0];
    }

    try {
      const result = await api.scanQRCode({ qrCode });
      if (result.success) {
        onScanSuccess(result.data.product, result.data.seller);
      } else {
        setError(result.error?.message || 'QR code inválido ou produto não encontrado');
      }
    } catch {
      setError('Erro ao processar QR code. Tente novamente.');
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (!videoRef.current || !isCameraActive) return;

    const codeReader = new BrowserQRCodeReader();
    codeReaderRef.current = codeReader;

    let isActive = true;
    let lastScannedCode = '';
    let isProcessing = false;

    const startScanning = async () => {
      try {
        await codeReader.decodeFromConstraints(
          { video: { facingMode: 'environment' } },
          videoRef.current!,
          (result) => {
            if (!isActive) return;
            if (result && !isProcessing) {
              const scannedText = result.getText();
              if (scannedText !== lastScannedCode) {
                lastScannedCode = scannedText;
                isProcessing = true;
                handleScan(scannedText).finally(() => {
                  setTimeout(() => {
                    isProcessing = false;
                    lastScannedCode = '';
                  }, 3000);
                });
              }
            }
          },
        );
      } catch (err) {
        console.error('Error starting QR scanner:', err);
        if (isActive) setError('Erro ao iniciar scanner. Tente recarregar a página.');
      }
    };

    startScanning();

    return () => {
      isActive = false;
      codeReader.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraActive]);

  const handleRetryPermission = () => {
    setError('');
    setHasPermission(null);
    checkCameraPermission();
  };

  if (hasPermission === null) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-primary">
        <Spinner size="lg" />
        <p className="mt-3 text-text-muted text-sm">Solicitando acesso à câmera...</p>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-14 h-14 rounded-full bg-warning/15 text-amber-600 flex items-center justify-center mb-4 [&_svg]:w-7 [&_svg]:h-7">
          <FontAwesomeIcon icon={faTriangleExclamation} />
        </div>
        <h3 className="text-base font-semibold text-text-main mb-1">
          Permissão de câmera necessária
        </h3>
        <p className="text-sm text-text-muted mb-5 max-w-sm">
          Para escanear QR codes, precisamos de acesso à câmera do seu dispositivo.
        </p>
        {error && (
          <div className="mb-4 w-full max-w-sm">
            <Alert variant="error">{error}</Alert>
          </div>
        )}
        <Button
          variant="primary"
          onClick={handleRetryPermission}
          leftIcon={<FontAwesomeIcon icon={faCamera} />}
        >
          Solicitar permissão
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {error && (
        <div className="w-full mb-3">
          <Alert variant="error" dismissible onDismiss={() => setError('')}>
            {error}
          </Alert>
        </div>
      )}

      {isScanning && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="text-center text-white">
            <Spinner size="lg" />
            <p className="mt-3">Processando QR code...</p>
          </div>
        </div>
      )}

      {/* Viewfinder da câmera */}
      <div className="relative w-full max-w-md mx-auto">
        <div className="bg-neutral-900 rounded-2xl overflow-hidden shadow-xl">
          <div className="relative aspect-square">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            {/* Moldura de scan */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64">
                <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-lg" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FontAwesomeIcon icon={faQrcode} className="w-14 h-14 text-white/40" />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-md px-2.5 py-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-white text-xs font-medium">Câmera ativa</span>
            </div>

            <div className="absolute bottom-3 inset-x-3 bg-black/60 backdrop-blur-sm rounded-md px-3 py-2 text-center">
              <p className="text-white text-xs font-medium">Posicione o QR code na moldura</p>
            </div>
          </div>
        </div>

        {/* Entrada manual (testes) */}
        <div className="mt-4">
          <Input
            id="manual-qr"
            type="text"
            leftIcon={<FontAwesomeIcon icon={faKeyboard} />}
            placeholder="Ou digite o código QR (testes)"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                if (target.value.trim()) {
                  handleScan(target.value.trim());
                  target.value = '';
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
