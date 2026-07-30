import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/common/Spinner';
import type { Product } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint, faDownload, faQrcode, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { formatProductCondition, getConditionVariant } from '@/utils/formatters';

interface QRCodeDisplayProps {
  product: Product;
  qrCodeUrl?: string;
  onPrint?: () => void;
  onDownload?: () => void;
  loading?: boolean;
}

const currency = (value: number, curr: string) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: curr }).format(value);

export function QRCodeDisplay({
  product,
  qrCodeUrl,
  onPrint,
  onDownload,
  loading = false,
}: QRCodeDisplayProps) {
  return (
    <>
      {/* View de impressão (etiqueta) */}
      <div className="hidden print:flex flex-col items-center justify-center p-8 border-4 border-black m-4 text-center">
        <h1 className="text-4xl font-bold mb-4 text-black">{product.name}</h1>
        {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="w-[400px] h-[400px] mb-4" />}
        <p className="text-5xl font-bold text-black mb-2">{currency(product.price, product.currency)}</p>
        <p className="text-xl text-black">{product.category}</p>
        <p className="text-sm mt-8 text-neutral-500">coisasdegaragem.com</p>
      </div>

      {/* View de tela */}
      <div className="print:hidden space-y-5">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-text-main">QR Code do produto</h3>
          <p className="text-sm text-text-muted mt-0.5">{product.name}</p>
        </div>

        {/* QR */}
        <div className="flex justify-center">
          {loading ? (
            <div className="w-56 h-56 bg-surface-sunken rounded-xl flex items-center justify-center text-primary">
              <Spinner size="lg" />
            </div>
          ) : qrCodeUrl ? (
            <div className="bg-white p-3 rounded-xl border border-border shadow-sm">
              <img src={qrCodeUrl} alt={`QR Code para ${product.name}`} className="w-56 h-56" />
            </div>
          ) : (
            <div className="w-56 h-56 bg-surface-sunken rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-border-strong">
              <FontAwesomeIcon icon={faQrcode} className="w-10 h-10 text-text-subtle mb-2" />
              <p className="text-sm text-text-muted font-medium">QR code não gerado</p>
            </div>
          )}
        </div>

        {/* Detalhes */}
        <div className="bg-surface-sunken/60 rounded-lg p-4 space-y-2.5">
          <DetailRow label="Preço">
            <span className="text-lg font-bold text-text-main">
              {currency(product.price, product.currency)}
            </span>
          </DetailRow>
          <DetailRow label="Categoria">
            <span className="font-medium text-text-main">{product.category || 'Não definida'}</span>
          </DetailRow>
          <DetailRow label="Condição">
            <Badge variant={getConditionVariant(product.condition)}>
              {formatProductCondition(product.condition)}
            </Badge>
          </DetailRow>
          <DetailRow label="Status">
            {product.isSold ? (
              <Badge variant="error">Vendido</Badge>
            ) : !product.isAvailable ? (
              <Badge variant="warning">Indisponível</Badge>
            ) : (
              <Badge variant="success" dot>Disponível</Badge>
            )}
          </DetailRow>
        </div>

        {/* Aviso */}
        <div className="flex items-start gap-2 text-xs text-text-muted bg-info/5 p-3 rounded-lg border border-info/20">
          <FontAwesomeIcon icon={faCircleInfo} className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
          <p>
            Use este QR code para identificar seus produtos na garagem. Compradores podem escanear
            para ver detalhes e realizar a compra.
          </p>
        </div>

        {/* Ações */}
        <div className="flex gap-3">
          {onPrint && (
            <Button
              variant="primary"
              onClick={onPrint}
              disabled={!qrCodeUrl || loading}
              className="flex-1"
              leftIcon={<FontAwesomeIcon icon={faPrint} />}
            >
              Imprimir
            </Button>
          )}
          {onDownload && (
            <Button
              variant="outline"
              onClick={onDownload}
              disabled={!qrCodeUrl || loading}
              className="flex-1"
              leftIcon={<FontAwesomeIcon icon={faDownload} />}
            >
              Baixar PDF
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-text-muted">{label}</span>
      {children}
    </div>
  );
}
