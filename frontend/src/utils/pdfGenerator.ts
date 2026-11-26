import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface ProductLabelData {
  name: string;
  price: number;
  currency: string;
  qrCodeUrl: string;
  category?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildPdfFileName(productName: string): string {
  const slug = productName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `cdf-${slug || 'produto'}.pdf`;
}

function getSiteHost(): string {
  if (
    typeof window !== 'undefined' &&
    window.location?.host &&
    !['localhost', '127.0.0.1'].includes(window.location.hostname)
  ) {
    return window.location.host;
  }
  return 'coisasdegaragem.com.br';
}

function buildLabelMarkup(product: ProductLabelData): string {
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: product.currency || 'BRL',
  }).format(product.price);

  const safeName = escapeHtml(product.name);
  const safeCategory = product.category ? escapeHtml(product.category) : '';
  const safeHost = escapeHtml(getSiteHost());

  return `
    <div style="margin-bottom: 24px; width: 100%;">
      <div style="font-size: 26px; font-weight: 900; color: #2563eb; letter-spacing: -0.5px; margin-bottom: 4px;">Coisas de Garagem</div>
      <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Garage Sale Local Official</div>
    </div>

    <div style="margin-bottom: 26px; width: 100%;">
      <h1 style="font-size: 30px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.15; letter-spacing: -0.8px; word-break: break-word;">${safeName}</h1>
      ${safeCategory ? `<div style="margin-top: 10px;"><span style="font-size: 13px; color: #2563eb; font-weight: 700; background: #eff6ff; display: inline-block; padding: 6px 14px; line-height: 1.2; border-radius: 999px;">${safeCategory}</span></div>` : ''}
    </div>

    <div style="background: white; padding: 18px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); margin-bottom: 30px; border: 1px solid #f1f5f9; display: flex; justify-content: center;">
      <img src="${product.qrCodeUrl}" crossorigin="anonymous" style="width: 210px; height: 210px; display: block;" />
    </div>

    <div style="margin-bottom: 30px;">
      <div style="font-size: 40px; font-weight: 900; color: #0f172a; letter-spacing: -1px;">${formattedPrice}</div>
    </div>

    <div style="border-top: 1px solid #e2e8f0; width: 100%; padding-top: 22px;">
      <div style="font-size: 11px; color: #64748b; margin-bottom: 4px; font-weight: 500;">Gerado automaticamente por</div>
      <div style="font-size: 16px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px;">${safeHost}</div>
    </div>
  `;
}

/**
 * Imprime uma única etiqueta limpa em um iframe isolado, evitando que modais
 * com position: fixed sejam repetidos em várias páginas pelo navegador.
 */
export async function printProductLabel(product: ProductLabelData): Promise<void> {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const frameWindow = iframe.contentWindow;
  const frameDoc = iframe.contentDocument || frameWindow?.document;
  if (!frameWindow || !frameDoc) {
    document.body.removeChild(iframe);
    throw new Error('Não foi possível iniciar a impressão da etiqueta.');
  }

  frameDoc.open();
  frameDoc.write(`<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(buildPdfFileName(product.name).replace(/\.pdf$/, ''))}</title>
    <style>
      @page {
        size: auto;
        margin: 12mm;
      }
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      html, body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        font-family: Arial, Helvetica, sans-serif;
      }
      .print-page {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 12px 0;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .label-card {
        width: 400px;
        max-width: 100%;
        padding: 36px;
        background: #ffffff;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 2px solid #e2e8f0;
        border-radius: 24px;
        break-inside: avoid;
        page-break-inside: avoid;
      }
    </style>
  </head>
  <body>
    <div class="print-page">
      <div class="label-card">
        ${buildLabelMarkup(product)}
      </div>
    </div>
  </body>
</html>`);
  frameDoc.close();

  const img = frameDoc.querySelector('img');
  if (img && !img.complete) {
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  }

  await new Promise((r) => setTimeout(r, 80));

  const cleanup = () => {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  };

  frameWindow.onafterprint = cleanup;
  frameWindow.focus();
  frameWindow.print();

  // Fallback de limpeza caso o navegador não dispare onafterprint.
  setTimeout(cleanup, 60_000);
}

export async function generateProductPDF(product: ProductLabelData) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';
  iframe.style.width = '500px';
  iframe.style.height = '800px';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const frameDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!frameDoc) {
    document.body.removeChild(iframe);
    throw new Error('Could not create iframe for PDF generation');
  }

  const label = frameDoc.createElement('div');
  label.style.width = '400px';
  label.style.padding = '40px';
  label.style.backgroundColor = 'white';
  label.style.textAlign = 'center';
  label.style.fontFamily = 'Arial, sans-serif';
  label.style.display = 'flex';
  label.style.flexDirection = 'column';
  label.style.alignItems = 'center';
  label.style.justifyContent = 'center';
  label.style.border = '2px solid #f0f0f0';
  label.style.borderRadius = '24px';
  label.innerHTML = buildLabelMarkup(product);

  frameDoc.body.appendChild(label);
  frameDoc.body.style.margin = '0';
  frameDoc.body.style.padding = '0';
  frameDoc.body.style.backgroundColor = 'white';

  try {
    const img = label.querySelector('img');
    if (img && !img.complete) {
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }

    await new Promise((r) => setTimeout(r, 100));

    const canvas = await html2canvas(label, {
      scale: 4,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a6',
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    const yContent = (pdf.internal.pageSize.getHeight() - pdfHeight) / 2;

    pdf.addImage(imgData, 'PNG', 0, yContent, pdfWidth, pdfHeight);
    pdf.save(buildPdfFileName(product.name));
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    document.body.removeChild(iframe);
  }
}
