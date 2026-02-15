import { SellerLayout } from '@/components/seller/SellerLayout';
import { ProductCard } from '@/components/seller/ProductCard';
import { ProductForm } from '@/components/seller/ProductForm';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { QRCodeDisplay } from '@/components/seller/QRCodeDisplay';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Pagination } from '@/components/common/Pagination';
import { useProducts } from '@/hooks/useProducts';
import { api } from '@/services/api';
import { useProductsStore } from '@/store/productsStore';
import { useState, useEffect, useRef } from 'react';
import type { Product, CreateProductRequest, UpdateProductRequest } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faBoxOpen,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { generateProductPDF } from '@/utils/pdfGenerator';

import { useLocation } from 'react-router-dom';

export default function ProductsPage() {
  const { products, fetchProducts } = useProducts();
  const { addProduct, updateProduct, deleteProduct } = useProductsStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const [showForm, setShowForm] = useState(location.state?.showForm || false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrProduct, setQrProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const pageSize = 9;

  // Filter products based on search term
  const filteredProducts = (products || []).filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'price') {
      comparison = a.price - b.price;
    } else if (sortBy === 'date') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Paginate sorted products
  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + pageSize);

  // Reset to page 1 when search term or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  // Load products on mount
  useState(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError('');
      try {
        await fetchProducts();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  });

  // Animations
  useGSAP(() => {
    if (!isLoading && containerRef.current && paginatedProducts.length > 0) {
      gsap.from('.product-card-item', {
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'all'
      });
    }
  }, { dependencies: [isLoading, currentPage, searchTerm, sortBy, sortOrder], scope: containerRef });

  const handleCreate = () => {
    setEditingProduct(undefined);
    setShowForm(true);
    setFormError('');
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
    setFormError('');
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        const result = await api.deleteProduct(productId);
        if (result.success) {
          deleteProduct(productId);
        } else {
          alert(result.error?.message || 'Erro ao excluir produto');
        }
      } catch (err) {
        alert('Erro ao excluir produto');
      }
    }
  };

  const handleGenerateQR = async (product: Product) => {
    try {
      const result = await api.getQRCode(product.id);
      if (result.success) {
        // Update product in local state to have the qrCodeUrl if it didn't have it
        const updatedProduct = { ...product, qrCodeUrl: result.data.url };
        updateProduct(product.id, updatedProduct);
        setQrProduct(updatedProduct);
      } else {
        alert(result.error?.message || 'Erro ao gerar QR code');
      }
    } catch (err) {
      alert('Erro ao gerar QR code');
    }
  };

  const handleDownloadPDF = async (product: Product) => {
    if (!product.qrCodeUrl) {
      alert('Gere o QR Code antes de baixar o PDF');
      return;
    }

    try {
      await generateProductPDF({
        name: product.name,
        price: product.price,
        currency: product.currency,
        qrCodeUrl: product.qrCodeUrl,
        category: product.category
      });
    } catch (err) {
      alert('Erro ao gerar PDF');
    }
  };

  const handleStatusChange = async (productId: string, status: 'available' | 'reserved' | 'sold') => {
    try {
      let result;
      if (status === 'available') {
        result = await api.unreserveProduct(productId);
      } else if (status === 'sold') {
        result = await api.markProductAsSold(productId);
      } else {
        return;
      }

      if (result.success) {
        updateProduct(productId, result.data);
      } else {
        alert(result.error?.message || 'Erro ao alterar status');
      }
    } catch (err) {
      alert('Erro ao alterar status');
    }
  };

  const handleSubmit = async (data: CreateProductRequest | UpdateProductRequest) => {
    setIsSubmitting(true);
    setFormError('');
    try {
      if (editingProduct) {
        const result = await api.updateProduct(editingProduct.id, data as UpdateProductRequest);
        if (result.success) {
          updateProduct(editingProduct.id, result.data);
          setShowForm(false);
        } else {
          setFormError(result.error?.message || 'Erro ao atualizar produto');
        }
      } else {
        const result = await api.createProduct(data as CreateProductRequest);
        if (result.success) {
          // After creating, automatically try to get QR code
          try {
            const qrResult = await api.getQRCode(result.data.id);
            if (qrResult.success) {
              result.data.qrCodeUrl = qrResult.data.url;
            }
          } catch (qrErr) {
            console.error('Error fetching QR after create:', qrErr);
          }

          addProduct(result.data);
          setShowForm(false);
        } else {
          setFormError(result.error?.message || 'Erro ao criar produto');
        }
      }
    } catch (err) {
      setFormError('Erro ao salvar produto');
    } finally {
      setIsSubmitting(false);
    }
  };

  useGSAP(() => {
    if (showForm) {
      gsap.from('.product-form-container', {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out'
      });
    }
  }, [showForm]);

  if (showForm) {
    return (
      <SellerLayout>
        <div className="max-w-4xl mx-auto product-form-container">
          <div className="mb-6">
            <Button variant="tertiary" onClick={() => setShowForm(false)} className="hover:bg-blue-50 text-[#4169E1]">
              ← Voltar para Lista
            </Button>
          </div>
          {formError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
              <p className="text-red-800 font-medium">{formError}</p>
            </div>
          )}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <ProductForm
              product={editingProduct}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div ref={containerRef} className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#4169E1] to-[#0047AB] rounded-2xl shadow-xl p-8 text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full transform -translate-x-1/3 translate-y-1/3 blur-2xl pointer-events-none"></div>

          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">
              Meus Produtos
            </h1>
            <p className="text-blue-100 text-lg">
              Gerencie todo o inventário da sua garagem em um só lugar
            </p>
          </div>

          <div className="relative z-10">
            <Button
              variant="tertiary"
              onClick={handleCreate}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40 backdrop-blur-sm shadow-lg whitespace-nowrap"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-1 bg-gray-50 border-b border-gray-100 px-4 py-2 flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <FontAwesomeIcon icon={faSearch} className="mr-2" />
            Filtros e Pesquisa
          </div>
          <div className="p-4 flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#4169E1] transition-colors">
                  <FontAwesomeIcon icon={faSearch} />
                </div>
                <Input
                  type="search"
                  placeholder="Buscar por nome, descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border-gray-200 focus:border-[#4169E1] focus:ring-[#4169E1] bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Selects */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="flex-1 sm:w-44">
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'date')}
                  options={[
                    { value: 'name', label: 'Nome' },
                    { value: 'price', label: 'Preço' },
                    { value: 'date', label: 'Data' },
                  ]}
                  className="w-full border-gray-200 focus:border-[#4169E1] focus:ring-[#4169E1]"
                />
              </div>
              <div className="flex-1 sm:w-48">
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  options={[
                    { value: 'asc', label: 'Crescente (A-Z)' },
                    { value: 'desc', label: 'Decrescente (Z-A)' },
                  ]}
                  className="w-full border-gray-200 focus:border-[#4169E1] focus:ring-[#4169E1]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4169E1] mb-4"></div>
            <p className="text-gray-500">Carregando seus produtos...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">Ops! Ocorreu um erro.</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <Button variant="primary" onClick={() => fetchProducts()} className="bg-red-600 hover:bg-red-700 text-white">
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && filteredProducts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.map((product) => (
                <div key={product.id} className="product-card-item h-full">
                  <ProductCard
                    product={product}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onGenerateQR={handleGenerateQR}
                    onDownloadPDF={handleDownloadPDF}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  pageSize={pageSize}
                  totalItems={filteredProducts.length}
                />
              </div>
            )}
          </>
        )}

        {/* Empty States */}
        {!isLoading && !error && filteredProducts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-200 p-12 text-center">
            {products.length > 0 ? (
              // Found nothing in search
              <>
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                  <FontAwesomeIcon icon={faSearch} className="text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Não encontramos resultados para "{searchTerm}". Tente termos diferentes ou limpe os filtros.
                </p>
                <Button variant="secondary" onClick={() => setSearchTerm('')}>
                  Limpar Busca
                </Button>
              </>
            ) : (
              // No products at all
              <>
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#4169E1]">
                  <FontAwesomeIcon icon={faBoxOpen} className="text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Vamos começar?
                </h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                  Você ainda não tem produtos cadastrados. Adicione seu primeiro item para começar a vender!
                </p>
                <Button variant="primary" onClick={handleCreate} className="bg-[#4169E1] hover:bg-[#0047AB] text-white px-8 py-3 text-lg h-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Adicionar Primeiro Produto
                </Button>
              </>
            )}
          </div>
        )}

        {/* QR Code Modal */}
        {qrProduct && (
          <Modal
            isOpen={!!qrProduct}
            onClose={() => setQrProduct(null)}
            title="QR Code do Produto"
            size="md"
          >
            <QRCodeDisplay
              product={qrProduct}
              qrCodeUrl={qrProduct.qrCodeUrl}
              onPrint={() => window.print()}
              onDownload={() => handleDownloadPDF(qrProduct)}
            />
          </Modal>
        )}
      </div>
    </SellerLayout>
  );
}
