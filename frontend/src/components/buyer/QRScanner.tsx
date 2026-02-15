import { useState, useEffect, useRef } from 'react';
import { BrowserQRCodeReader } from '@zxing/library';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/common/Button';
import { api } from '@/services/api';
import type { Product, User } from '@/types';
import { faQrcode, faExclamationTriangle, faCamera } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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


  // Check camera permission
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        // Just check permission, don't keep the stream open
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });

        setHasPermission(true);
        // Immediately stop the test stream
        stream.getTracks().forEach(track => track.stop());

        // Signal that camera is ready
        setIsCameraActive(true);
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setError('Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.');
          } else if (err.name === 'NotFoundError') {
            setError('Nenhuma câmera encontrada. Por favor, verifique se seu dispositivo possui uma câmera.');
          } else {
            setError(`Erro ao acessar câmera: ${err.message}`);
          }
        } else {
          setError('Erro ao acessar câmera. Por favor, tente novamente.');
        }
        setHasPermission(false);
      }
    };

    checkCameraPermission();

    // Cleanup function
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);

  // Start QR code scanning
  useEffect(() => {
    if (!videoRef.current || !isCameraActive) return;

    const codeReader = new BrowserQRCodeReader();
    codeReaderRef.current = codeReader;

    let isActive = true;
    let lastScannedCode = '';
    let isProcessing = false;

    const startScanning = async () => {
      try {
        // Use decodeFromConstraints to start continuous scanning
        const constraints = {
          video: { facingMode: 'environment' }
        };

        await codeReader.decodeFromConstraints(
          constraints,
          videoRef.current!,
          (result, error) => {
            if (!isActive) return;

            if (result && !isProcessing) {
              const scannedText = result.getText();
              console.log('QR Code detected:', scannedText);

              // Prevent scanning the same code multiple times
              if (scannedText !== lastScannedCode) {
                lastScannedCode = scannedText;
                isProcessing = true;

                handleScan(scannedText).finally(() => {
                  // Allow scanning again after 3 seconds
                  setTimeout(() => {
                    isProcessing = false;
                    lastScannedCode = '';
                  }, 3000);
                });
              }
            }

            // Optionally log errors for debugging
            if (error && !(error.name === 'NotFoundException')) {
              console.debug('Scanner error (normal):', error.message);
            }
          }
        );
      } catch (err) {
        console.error('Error starting QR scanner:', err);
        if (isActive) {
          setError('Erro ao iniciar scanner. Tente recarregar a página.');
        }
      }
    };

    startScanning();

    return () => {
      isActive = false;
      codeReader.reset();
    };
  }, [isCameraActive]);

  const handleScan = async (scannedText: string) => {
    setIsScanning(true);
    setError('');

    // Extract ID from URL if scanned text is a URL
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
    } catch (err) {
      setError('Erro ao processar QR code. Por favor, tente novamente.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleRetryPermission = async () => {
    setError('');
    setHasPermission(null);
    window.location.reload();
  };

  // Loading state while checking permission
  if (hasPermission === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner />
        <p className="mt-4 text-gray-600">Solicitando acesso à câmera...</p>
      </div>
    );
  }

  // Permission denied state
  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        {error && (
          <Alert variant="error" dismissible onDismiss={() => setError('')}>
            {error}
          </Alert>
        )}
        <div className="text-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Permissão de Câmera Necessária
          </h3>
          <p className="text-gray-600 mb-6 max-w-md">
            Para escanear QR codes, precisamos de acesso à câmera do seu dispositivo.
          </p>
          <Button
            variant="primary"
            onClick={handleRetryPermission}
          >
            <FontAwesomeIcon icon={faCamera} className="mr-2" />
            Solicitar Permissão
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {error && (
        <Alert variant="error" dismissible onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      {isScanning && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="text-center">
            <Spinner />
            <p className="text-white mt-4">Processando QR code...</p>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-2xl mx-auto">
        {/* QR Scanner with live camera feed */}
        <div className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
          <div className="relative aspect-square">
            {/* Video element for camera feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Overlay with scanning frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                {/* Scanning frame corners */}
                <div className="w-64 h-64 relative">
                  {/* Top-left corner */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary-500"></div>
                  {/* Top-right corner */}
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary-500"></div>
                  {/* Bottom-left corner */}
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary-500"></div>
                  {/* Bottom-right corner */}
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary-500"></div>

                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faQrcode}
                      className="w-16 h-16 text-white/50 drop-shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status indicator */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-white text-sm font-medium">Câmera Ativa</span>
              </div>
              {isCameraActive && (
                <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                  <FontAwesomeIcon icon={faCamera} className="text-white text-sm" />
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
                <p className="text-white text-sm font-medium">
                  Posicione o QR code dentro da moldura
                </p>
                <p className="text-white/70 text-xs mt-1">
                  O código será escaneado automaticamente
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Manual input for testing */}
        <div className="mt-4 bg-white rounded-lg shadow p-4">
          <label htmlFor="manual-qr" className="block text-sm font-medium text-gray-700 mb-2">
            Ou digite o QR code manualmente (para testes):
          </label>
          <input
            id="manual-qr"
            type="text"
            placeholder="Digite o código QR aqui..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            onKeyPress={async (e) => {
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
