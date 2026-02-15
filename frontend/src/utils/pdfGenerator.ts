import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface ProductLabelData {
  name: string;
  price: number;
  currency: string;
  qrCodeUrl: string;
  category?: string;
}

export async function generateProductPDF(product: ProductLabelData) {
  // Create a hidden iframe to isolate styles
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

  // Create the label inside the iframe
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
  label.style.borderRadius = '24px'; // Slightly more premium

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: product.currency,
  }).format(product.price);

  label.innerHTML = `
    <div style="margin-bottom: 25px; width: 100%;">
      <div style="font-size: 26px; font-weight: 900; color: #2563eb; letter-spacing: -0.5px; margin-bottom: 4px;">Coisas de Garagem</div>
      <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Garage Sale Local Official</div>
    </div>
    
    <div style="margin-bottom: 30px; width: 100%;">
      <h1 style="font-size: 32px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.1; letter-spacing: -1px;">${product.name}</h1>
      ${product.category ? `<div style="font-size: 14px; color: #3b82f6; margin-top: 8px; font-weight: 600; background: #eff6ff; display: inline-block; padding: 4px 12px; border-radius: 99px;">${product.category}</div>` : ''}
    </div>

    <div style="background: white; padding: 20px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); margin-bottom: 35px; border: 1px solid #f1f5f9; display: flex; justify-content: center;">
      <img src="${product.qrCodeUrl}" style="width: 200px; height: 200px; display: block;" />
    </div>

    <div style="margin-bottom: 35px;">
      <div style="font-size: 42px; font-weight: 900; color: #0f172a; letter-spacing: -1px;">${formattedPrice}</div>
    </div>

    <div style="border-top: 1px solid #e2e8f0; width: 100%; padding-top: 25px;">
      <div style="font-size: 11px; color: #64748b; margin-bottom: 4px; font-weight: 500;">Gerado automaticamente por</div>
      <div style="font-size: 16px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px;">coisasdegaragem.com</div>
    </div>
  `;

  frameDoc.body.appendChild(label);
  frameDoc.body.style.margin = '0';
  frameDoc.body.style.padding = '0';
  frameDoc.body.style.backgroundColor = 'white';

  try {
    // Wait for image to load
    const img = label.querySelector('img');
    if (img && !img.complete) {
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }

    // Small delay to ensure rendering
    await new Promise(r => setTimeout(r, 100));

    const canvas = await html2canvas(label, {
      scale: 4, // Even higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a6'
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    const yContent = (pdf.internal.pageSize.getHeight() - pdfHeight) / 2;

    pdf.addImage(imgData, 'PNG', 0, yContent, pdfWidth, pdfHeight);
    pdf.save(`label-${product.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    document.body.removeChild(iframe);
  }
}
