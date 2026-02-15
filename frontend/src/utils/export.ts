import type { Purchase } from '@/types';

export function downloadCSV(data: any[], filename: string) {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Handle dates, strings with commas, etc.
                if (typeof value === 'string') {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportPurchasesToCSV(purchases: Purchase[], filename: string = 'transacoes.csv') {
    const csvData = purchases.map(p => ({
        ID: p.id,
        Data: new Date(p.purchaseDate).toLocaleDateString(),
        Produto_ID: p.productId,
        Vendedor_ID: p.sellerId,
        Comprador_ID: p.buyerId,
        Preco: p.price,
        Moeda: p.currency,
        Status: p.status,
        Metodo_Pagamento: p.paymentMethod || '',
        QR_Code_Escaneado: p.qrCodeScanned ? 'Sim' : 'Não'
    }));

    downloadCSV(csvData, filename);
}
