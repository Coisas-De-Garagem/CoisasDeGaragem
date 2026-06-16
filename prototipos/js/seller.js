let products = [
    {
        id: 1,
        name: "Bicicleta Infantil",
        price: 80.00,
        description: "Bicicleta infantil em ótimo estado, aro 16, cor azul",
        image: null,
        qrCode: null
    },
    {
        id: 2,
        name: "Mesa de Centro",
        price: 120.00,
        description: "Mesa de centro de madeira, perfeita para sala de estar",
        image: null,
        qrCode: null
    },  
    {
        id: 3,
        name: "Livros Diversos",
        price: 25.00,
        description: "Coleção de livros variados, ficção e não-ficção",
        image: null,
        qrCode: null
    }
];

let currentProduct = null;

const addProductBtn = document.getElementById('add-product-btn');
const addProductForm = document.getElementById('add-product-form');
const productForm = document.getElementById('product-form');
const cancelBtn = document.getElementById('cancel-btn');
const productsGrid = document.getElementById('products-grid');
const qrModal = document.getElementById('qr-modal');
const closeModalBtns = document.querySelectorAll('#close-modal, #close-modal-btn');
const downloadPdfBtn = document.getElementById('download-pdf-btn');
const successToast = document.getElementById('success-toast');

document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    renderProducts();
    updateStats();
    initializeEventListeners();
});

function initializeEventListeners() {
    addProductBtn.addEventListener('click', showAddProductForm);
    cancelBtn.addEventListener('click', hideAddProductForm);
    productForm.addEventListener('submit', handleAddProduct);
    
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeQRModal);
    });
    
    downloadPdfBtn.addEventListener('click', downloadProductPDF);
    
    qrModal.addEventListener('click', function(e) {
        if (e.target === qrModal) {
            closeQRModal();
        }
    });
    
    productForm.addEventListener('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
        }
    });
}

function showAddProductForm() {
    addProductForm.classList.add('active');
    addProductBtn.style.display = 'none';
    document.getElementById('product-name').focus();
}

function hideAddProductForm() {
    addProductForm.classList.remove('active');
    addProductBtn.style.display = 'inline-flex';
    productForm.reset();
}

function validateForm() {
    const name = document.getElementById('product-name').value.trim();
    const price = document.getElementById('product-price').value;
    
    if (!name) {
        showToast('Nome do produto é obrigatório', 'error');
        return false;
    }
    
    if (!price || price <= 0) {
        showToast('Preço deve ser maior que zero', 'error');
        return false;
    }
    
    return true;
}

function handleAddProduct(e) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const description = document.getElementById('product-description').value;
    const imageFile = document.getElementById('product-image').files[0];
    
    const newProduct = {
        id: generateProductId(),
        name: name,
        price: price,
        description: description,
        image: null,
        qrCode: null
    };
    
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newProduct.image = e.target.result;
            addProductToList(newProduct);
        };
        reader.readAsDataURL(imageFile);
    } else {
        addProductToList(newProduct);
    }
}

function addProductToList(product) {
    products.push(product);
    saveProducts();
    renderProducts();
    updateStats();
    hideAddProductForm();
    showToast('Produto adicionado com sucesso!');
}

function renderProducts() {
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
        <div class="product-image">
            ${product.image ? 
                `<img src="${product.image}" alt="${product.name}">` : 
                '<i class="fas fa-image"></i>'
            }
        </div>
        <div class="product-content">
            <h3 class="product-name">${product.name}</h3>
            <div class="product-price">R$ ${product.price.toFixed(2)}</div>
            <p class="product-description">${product.description}</p>
            <div class="product-actions">
                <button class="btn btn-primary btn-small" data-action="show-qr" data-id="${product.id}">
                    <i class="fas fa-qrcode"></i>
                    Ver QR Code
                </button>
                <button class="btn btn-outline btn-small" data-action="edit" data-id="${product.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline btn-small" data-action="delete" data-id="${product.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    card.querySelector('[data-action="show-qr"]').addEventListener('click', () => showQRCode(product.id));
    card.querySelector('[data-action="edit"]').addEventListener('click', () => editProduct(product.id));
    card.querySelector('[data-action="delete"]').addEventListener('click', () => deleteProduct(product.id));
    
    return card;
}

const QRCodeManager = {
    init: async function() {
        if (typeof qrcode === 'function') {
            return true;
        }
        
        try {
            await this.loadLibrary();
            return true;
        } catch (e) {
            console.error("Não foi possível carregar a biblioteca QRCode", e);
            return false;
        }
    },
    
    loadLibrary: function() {
        return new Promise((resolve, reject) => {
            if (typeof qrcode === 'function') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },
    
    generate: function(text, size = 200) {
        const qr = qrcode(0, 'L');
        qr.addData(text);
        qr.make();
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        const moduleCount = qr.getModuleCount();
        const cellSize = size / moduleCount;
        
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                ctx.fillStyle = qr.isDark(row, col) ? '#6366f1' : '#ffffff';
                ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            }
        }
        
        return canvas;
    }
};

async function showQRCode(productId) {
    try {
        const product = products.find(p => p.id === productId);
        if (!product) {
            throw new Error("Produto não encontrado");
        }
        
        currentProduct = product;
        
        const qrAvailable = await QRCodeManager.init();
        
        if (!qrAvailable) {
            throw new Error("Recurso de QR Code indisponível");
        }
        
        const qrCanvas = document.getElementById('qr-canvas');
        const ctx = qrCanvas.getContext('2d');
        ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
        
        const productUrl = `https://coisasdegaragem.com/produto?id=${product.id}`;  //MUDAR PARA O URL CORRETO APOS O DEPLOY - ISSO ALTERA O LINK DO QR CODE
        const generatedQR = QRCodeManager.generate(productUrl, qrCanvas.width);
        
        ctx.drawImage(generatedQR, 0, 0, qrCanvas.width, qrCanvas.height);
        
        product.qrCode = qrCanvas.toDataURL('image/png');
        saveProducts();
        
        updateModalInfo(product);
        qrModal.classList.add('active');
        
    } catch (error) {
        console.error("Erro ao mostrar QR Code:", error);
        showToast("Não foi possível gerar o QR Code", 'error');
        
        if (currentProduct) {
            updateModalInfo(currentProduct);
            qrModal.classList.add('active');
            drawManualFallback(document.getElementById('qr-canvas'), currentProduct);
        }
    }
}

function drawManualFallback(canvas, product) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(product.name, canvas.width/2, 30);
    
    ctx.font = '20px Arial';
    ctx.fillText(`R$ ${product.price.toFixed(2)}`, canvas.width/2, 60);
    
    ctx.font = '14px Arial';
    ctx.fillText('(QR Code indisponível)', canvas.width/2, 90);
}

function updateModalInfo(product) {
    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('modal-product-price').textContent = `R$ ${product.price.toFixed(2)}`;
}

function closeQRModal() {
    qrModal.classList.remove('active');
    currentProduct = null;
}

function downloadProductPDF() {
    if (!currentProduct) return;
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFont('helvetica', 'bold');
        
        doc.setFontSize(20);
        doc.setTextColor(99, 102, 241);
        doc.text('Coisas de Garagem', 105, 20, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(currentProduct.name, 105, 40, { align: 'center' });
        
        doc.setFontSize(14);
        doc.text(`Preço: R$ ${currentProduct.price.toFixed(2)}`, 105, 50, { align: 'center' });
        
        const qrCanvas = document.getElementById('qr-canvas');
        const qrSize = 80;
        const pageWidth = doc.internal.pageSize.getWidth();
        const qrX = (pageWidth - qrSize) / 2;
        
        if (currentProduct.qrCode) {
            doc.addImage(currentProduct.qrCode, 'PNG', qrX, 60, qrSize, qrSize);
        } else {
            doc.setFontSize(12);
            doc.text('QR Code não disponível', 105, 100, { align: 'center' });
        }
        
        if (currentProduct.description) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const splitDescription = doc.splitTextToSize(currentProduct.description, 180);
            doc.text(splitDescription, 105, 150, { align: 'center' });
        }
        
        doc.setFontSize(8);
        doc.setTextColor(99, 102, 241);
        doc.text('Escaneie o QR code para mais informações', 105, 280, { align: 'center' });
        
        const fileName = `produto_${currentProduct.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        doc.save(fileName);
        
        showToast('PDF baixado com sucesso!');
    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        showToast('Erro ao gerar PDF', 'error');
    }
}

function editProduct(productId) {
    showToast('Funcionalidade de edição em desenvolvimento');
}

function deleteProduct(productId) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        products = products.filter(p => p.id !== productId);
        saveProducts();
        renderProducts();
        updateStats();
        showToast('Produto excluído com sucesso!');
    }
}

function updateStats() {
    document.getElementById('total-products').textContent = products.length;
    document.getElementById('qr-generated').textContent = products.length;
    
    const totalRevenue = products.reduce((sum, product) => sum + product.price, 0);
    document.getElementById('total-revenue').textContent = `R$ ${totalRevenue.toFixed(2)}`;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('success-toast');
    const toastMessage = document.getElementById('toast-message');
    
    toast.style.display = 'none';
    toast.classList.remove('show');
    void toast.offsetWidth;
    
    toastMessage.textContent = message;
    
    if (type === 'error') {
        toast.style.background = 'var(--error-color)';
        toast.querySelector('i').className = 'fas fa-exclamation-circle';
    } else {
        toast.style.background = 'var(--success-color)';
        toast.querySelector('i').className = 'fas fa-check-circle';
    }
    
    toast.style.display = 'flex';
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.style.display = 'none';
        }, 300);
    }, 3000);
}

function saveProducts() {
    localStorage.setItem('garage_sale_products', JSON.stringify(products));
}

function loadProducts() {
    const savedProducts = localStorage.getItem('garage_sale_products');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    }
}

function generateProductId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});