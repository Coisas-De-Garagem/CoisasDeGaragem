let html5QrCode = null;
let isScanning = false;
let currentProduct = null;

let availableProducts = [
    {
        id: 1,
        name: "Bicicleta Infantil",
        price: 80.00,
        description: "Bicicleta infantil em ótimo estado, aro 16, cor azul",
        seller: "João Silva",
        category: "toys",
        image: null,
        available: true
    },
    {
        id: 2,
        name: "Mesa de Centro",
        price: 120.00,
        description: "Mesa de centro de madeira, perfeita para sala de estar",
        seller: "Maria Santos",
        category: "furniture",
        image: null,
        available: true
    },
    {
        id: 3,
        name: "Livros Diversos",
        price: 25.00,
        description: "Coleção de livros variados, ficção e não-ficção",
        seller: "Carlos Silva",
        category: "books",
        image: null,
        available: true
    },
    {
        id: 4,
        name: "Smartphone Samsung",
        price: 350.00,
        description: "Samsung Galaxy A54, 128GB, em excelente estado",
        seller: "Ana Costa",
        category: "electronics",
        image: null,
        available: true
    }
];

let purchaseHistory = [
    {
        id: 1,
        productName: "Bicicleta Infantil",
        price: 80.00,
        seller: "João Silva",
        date: "2024-12-15",
        status: "completed",
        image: null
    },
    {
        id: 2,
        productName: "Mesa de Centro",
        price: 120.00,
        seller: "Maria Santos",
        date: "2024-12-14",
        status: "completed",
        image: null
    },
    {
        id: 3,
        productName: "Livros Diversos",
        price: 25.00,
        seller: "Carlos Silva",
        date: "2024-12-13",
        status: "completed",
        image: null
    }
];

const toggleCameraBtn = document.getElementById('toggle-camera');
const scannerPlaceholder = document.getElementById('scanner-placeholder');
const scannerStatus = document.getElementById('scanner-status');
const manualCodeInput = document.getElementById('manual-code');
const searchProductBtn = document.getElementById('search-product');
const availableProductsGrid = document.getElementById('available-products');
const purchasesGrid = document.getElementById('purchases-grid');
const productModal = document.getElementById('product-modal');
const purchaseModal = document.getElementById('purchase-modal');
const successToast = document.getElementById('success-toast');

let loggedUser = null;

function saveUser(user) {
    localStorage.setItem('garage_sale_user', JSON.stringify(user));
    loggedUser = user;
}

function loadUser() {
    const user = localStorage.getItem('garage_sale_user');
    if (user) {
        loggedUser = JSON.parse(user);
    }
}
loadUser();

function requireLogin(next) {
    if (loggedUser) {
        next();
    } else {
        document.getElementById('login-modal').classList.add('active');
        document.getElementById('login-form').onsubmit = function(e) {
            e.preventDefault();
            const user = {
                name: document.getElementById('user-name').value.trim(),
                cpf: document.getElementById('user-cpf').value.trim(),
                email: document.getElementById('user-email').value.trim(),
                phone: document.getElementById('user-phone').value.trim()
            };
            if (!user.name || !user.cpf || !user.email || !user.phone) {
                showToast('Preencha todos os campos', 'error');
                return;
            }
            saveUser(user);
            document.getElementById('login-modal').classList.remove('active');
            next();
        };
        document.getElementById('close-login-modal').onclick = function() {
            document.getElementById('login-modal').classList.remove('active');
        };
    }
}

document.addEventListener('DOMContentLoaded', function() {
    renderAvailableProducts();
    renderPurchaseHistory();
    updatePurchaseStats();
    initializeEventListeners();
});

function initializeEventListeners() {
    toggleCameraBtn.addEventListener('click', toggleCamera);
    searchProductBtn.addEventListener('click', searchProductManually);
    manualCodeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchProductManually();
        }
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterProducts(this.dataset.filter);
        });
    });

    document.querySelectorAll('#close-product-modal, #close-product-modal-btn').forEach(btn => {
        btn.addEventListener('click', closeProductModal);
    });

    document.querySelectorAll('#close-purchase-modal, #cancel-purchase-btn').forEach(btn => {
        btn.addEventListener('click', closePurchaseModal);
    });

    document.getElementById('buy-product-btn').addEventListener('click', showPurchaseModal);
    document.getElementById('confirm-purchase-btn').addEventListener('click', confirmPurchase);

    productModal.addEventListener('click', function(e) {
        if (e.target === productModal) {
            closeProductModal();
        }
    });

    purchaseModal.addEventListener('click', function(e) {
        if (e.target === purchaseModal) {
            closePurchaseModal();
        }
    });

    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                loginModal.classList.remove('active');
            }
        });
    }
}

function toggleCamera() {
    if (!isScanning) {
        startScanning();
    } else {
        stopScanning();
    }
}

function startScanning() {
    const qrReaderElement = document.getElementById('qr-reader');
    
    html5QrCode = new Html5Qrcode("qr-reader");
    
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    };

    html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure
    ).then(() => {
        isScanning = true;
        toggleCameraBtn.innerHTML = '<i class="fas fa-stop"></i> Parar Câmera';
        toggleCameraBtn.classList.remove('btn-outline');
        toggleCameraBtn.classList.add('btn-primary');
        scannerPlaceholder.style.display = 'none';
        updateScannerStatus('Escaneando... Posicione o QR code na área destacada');
    }).catch(err => {
        console.error('Error starting camera:', err);
        showToast('Erro ao acessar a câmera. Verifique as permissões.', 'error');
        updateScannerStatus('Erro ao acessar a câmera');
    });
}

function stopScanning() {
    if (html5QrCode && isScanning) {
        html5QrCode.stop().then(() => {
            isScanning = false;
            toggleCameraBtn.innerHTML = '<i class="fas fa-camera"></i> Ativar Câmera';
            toggleCameraBtn.classList.remove('btn-primary');
            toggleCameraBtn.classList.add('btn-outline');
            scannerPlaceholder.style.display = 'block';
            updateScannerStatus('Posicione o QR code dentro da área de escaneamento');
        }).catch(err => {
            console.error('Error stopping camera:', err);
        });
    }
}

function onScanSuccess(decodedText, decodedResult) {
    console.log('QR Code scanned:', decodedText);

    const productId = extractProductIdFromQR(decodedText);
    
    if (productId) {
        const product = findProductById(productId);
        if (product) {
            showProductModal(product);
            showToast('Produto encontrado!');
        } else {
            showToast('Produto não encontrado', 'error');
        }
    } else {
        showToast('QR Code inválido', 'error');
    }

    stopScanning();
}

function onScanFailure(error) {
    // log de falhas
    // ex: console.warn('Falha ao escanear:', error);
}

function updateScannerStatus(message) {
    scannerStatus.innerHTML = `<p>${message}</p>`;
}

function extractProductIdFromQR(qrText) {
    const match = qrText.match(/(\d+)/);
    if (match) {
        return parseInt(match[1]);
    }
    return null;
}

function findProductById(productId) {
    return availableProducts.find(product => product.id === productId);
}

function searchProductManually() {
    const code = manualCodeInput.value.trim();
    if (!code) {
        showToast('Digite um código válido', 'error');
        return;
    }
    
    const productId = extractProductIdFromQR(code);
    if (productId) {
        const product = findProductById(productId);
        if (product) {
            showProductModal(product);
            showToast('Produto encontrado!');
            manualCodeInput.value = '';
        } else {
            showToast('Produto não encontrado', 'error');
        }
    } else {
        showToast('Código inválido', 'error');
    }
}

function renderAvailableProducts(filter = 'all') {
    availableProductsGrid.innerHTML = '';
    
    const filteredProducts = filter === 'all' 
        ? availableProducts 
        : availableProducts.filter(product => product.category === filter);
    
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        availableProductsGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => showProductModal(product);
    
    card.innerHTML = `
        <div class="product-image">
            ${product.image ? 
                `<img src="${product.image}" alt="${product.name}">` : 
                '<i class="fas fa-image"></i>'
            }
            ${product.available ? '<div class="product-badge">Disponível</div>' : ''}
        </div>
        <div class="product-content">
            <h3 class="product-name">${product.name}</h3>
            <div class="product-price">R$ ${product.price.toFixed(2)}</div>
            <div class="product-seller">
                <i class="fas fa-store"></i>
                <span>${product.seller}</span>
            </div>
            <div class="product-actions">
                <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); showProductModal(${product.id})">
                    Ver Detalhes
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function filterProducts(category) {
    renderAvailableProducts(category);
}

function renderPurchaseHistory() {
    purchasesGrid.innerHTML = '';
    
    purchaseHistory.forEach(purchase => {
        const purchaseCard = createPurchaseCard(purchase);
        purchasesGrid.appendChild(purchaseCard);
    });
}

function createPurchaseCard(purchase) {
    const card = document.createElement('div');
    card.className = 'purchase-card';
    
    const statusClass = purchase.status === 'completed' ? 'completed' : 'pending';
    const statusText = purchase.status === 'completed' ? 'Concluída' : 'Pendente';
    
    card.innerHTML = `
        <div class="purchase-image">
            ${purchase.image ? 
                `<img src="${purchase.image}" alt="${purchase.productName}">` : 
                '<i class="fas fa-shopping-bag"></i>'
            }
        </div>
        <div class="purchase-info">
            <h3 class="purchase-name">${purchase.productName}</h3>
            <div class="purchase-details">
                <span class="purchase-price">R$ ${purchase.price.toFixed(2)}</span>
                <span class="purchase-date">${formatDate(purchase.date)}</span>
            </div>
            <div class="purchase-seller">Vendedor: ${purchase.seller}</div>
        </div>
        <div class="purchase-status">
            <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
    `;
    
    return card;
}

function updatePurchaseStats() {
    const totalPurchases = purchaseHistory.length;
    const totalSpent = purchaseHistory.reduce((sum, purchase) => sum + purchase.price, 0);
    
    document.getElementById('total-purchases').textContent = totalPurchases;
    document.getElementById('total-spent').textContent = `R$ ${totalSpent.toFixed(2)}`;
}

function showProductModal(product) {
    if (typeof product === 'number') {
        product = findProductById(product);
    }
    
    if (!product) return;
    
    currentProduct = product;

    const modalImage = document.getElementById('modal-product-image');
    modalImage.innerHTML = product.image ? 
        `<img src="${product.image}" alt="${product.name}">` : 
        '<i class="fas fa-image"></i>';
    
    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('modal-product-price').textContent = `R$ ${product.price.toFixed(2)}`;
    document.getElementById('modal-product-description').textContent = product.description;
    document.getElementById('modal-seller-name').textContent = product.seller;
    
    productModal.classList.add('active');
}

function closeProductModal() {
    productModal.classList.remove('active');
    currentProduct = null;
}

function showPurchaseModal() {
    if (!currentProduct) return;
    requireLogin(() => {
        document.getElementById('purchase-product-name').textContent = currentProduct.name;
        document.getElementById('purchase-product-price').textContent = `R$ ${currentProduct.price.toFixed(2)}`;
        document.getElementById('purchase-seller-name').textContent = currentProduct.seller;
        document.getElementById('purchase-total-price').textContent = `R$ ${currentProduct.price.toFixed(2)}`;
        closeProductModal();
        purchaseModal.classList.add('active');
    });
}

function closePurchaseModal() {
    purchaseModal.classList.remove('active');
}

function confirmPurchase() {
    if (!currentProduct) return;
    const newPurchase = {
        id: Date.now(),
        productName: currentProduct.name,
        price: currentProduct.price,
        seller: currentProduct.seller,
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        image: currentProduct.image,
        buyer: loggedUser
    };
    purchaseHistory.unshift(newPurchase);
    renderPurchaseHistory();
    updatePurchaseStats();
    closePurchaseModal();
    showToast('Compra realizada com sucesso!');
    currentProduct = null;
    saveData();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
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

function saveData() {
    localStorage.setItem('garage_sale_purchases', JSON.stringify(purchaseHistory));
}

function loadData() {
    const savedPurchases = localStorage.getItem('garage_sale_purchases');
    if (savedPurchases) {
        purchaseHistory = JSON.parse(savedPurchases);
    }
}

loadData();

function addPurchase(purchase) {
    purchaseHistory.unshift(purchase);
    saveData();
}

document.addEventListener('visibilitychange', function() {
    if (document.hidden && isScanning) {
        stopScanning();
    }
});

window.addEventListener('beforeunload', function() {
    if (isScanning) {
        stopScanning();
    }
});

