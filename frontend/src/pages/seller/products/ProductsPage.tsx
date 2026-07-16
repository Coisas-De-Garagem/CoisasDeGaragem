import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBoxOpen, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { ProductCard } from '@/components/seller/ProductCard';
import { ProductForm } from '@/components/seller/ProductForm';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Card } from '@/components/common/Card';
import { Select } from '@/components/common/Select';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import { EmptyState } from '@/components/common/EmptyState';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { QRCodeDisplay } from '@/components/seller/QRCodeDisplay';
import { useProducts } from '@/hooks/useProducts';
import { api } from '@/services/api';
import { useProductsStore } from '@/store/productsStore';
import { generateProductPDF } from '@/utils/pdfGenerator';
import type { Product, CreateProductRequest, UpdateProductRequest } from '@/types';

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

  const filteredProducts = (products || []).filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
    else if (sortBy === 'price') comparison = a.price - b.price;
    else if (sortBy === 'date')
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + pageSize);

  // Reseta a paginação quando filtros/ordenação mudam.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  // Carrega produtos ao montar.
  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animações.
  useGSAP(
    () => {
      if (!isLoading && containerRef.current && paginatedProducts.length > 0) {
        gsap.from('.product-card-item', {
          y: 24,
          opacity: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power2.out',
          clearProps: 'all',
        });
      }
    },
    { dependencies: [isLoading, currentPage, searchTerm, sortBy, sortOrder], scope: containerRef },
  );

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
        if (result.success) deleteProduct(productId);
        else alert(result.error?.message || 'Erro ao excluir produto');
      } catch {
        alert('Erro ao excluir produto');
      }
    }
  };

  const handleGenerateQR = async (product: Product) => {
    try {
      const result = await api.getQRCode(product.id);
      if (result.success) {
        const updatedProduct = { ...product, qrCodeUrl: result.data.url };
        updateProduct(product.id, updatedProduct);
        setQrProduct(updatedProduct);
      } else {
        alert(result.error?.message || 'Erro ao gerar QR code');
      }
    } catch {
      alert('Erro ao gerar QR code');
    }
  };

  const handleDownloadPDF = async (product: Product) => {
    if (!product.qrCodeUrl) {
      alert('Gere o QR code antes de baixar o PDF');
      return;
    }
    try {
      await generateProductPDF({
        name: product.name,
        price: product.price,
        currency: product.currency,
        qrCodeUrl: product.qrCodeUrl,
        category: product.category,
      });
    } catch {
      alert('Erro ao gerar PDF');
    }
  };

  const handleStatusChange = async (
    productId: string,
    status: 'available' | 'reserved' | 'sold',
  ) => {
    try {
      let result;
      if (status === 'available') result = await api.unreserveProduct(productId);
      else if (status === 'sold') result = await api.markProductAsSold(productId);
      else return;

      if (result.success) updateProduct(productId, result.data);
      else alert(result.error?.message || 'Erro ao alterar status');
    } catch {
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
          try {
            const qrResult = await api.getQRCode(result.data.id);
            if (qrResult.success) result.data.qrCodeUrl = qrResult.data.url;
          } catch (qrErr) {
            console.error('Error fetching QR after create:', qrErr);
          }
          addProduct(result.data);
          setShowForm(false);
        } else {
          setFormError(result.error?.message || 'Erro ao criar produto');
        }
      }
    } catch {
      setFormError('Erro ao salvar produto');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Form view ----
  if (showForm) {
    return (
      <div className="max-w-3xl mx-auto product-form-container">
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(false)}
            leftIcon={<FontAwesomeIcon icon={faArrowLeft} />}
          >
            Voltar para a lista
          </Button>
        </div>
        {formError && (
          <div className="mb-4">
            <Alert variant="error" dismissible onDismiss={() => setFormError('')}>
              {formError}
            </Alert>
          </div>
        )}
        <Card>
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-text-main">
              {editingProduct ? 'Editar produto' : 'Novo produto'}
            </h2>
          </div>
          <ProductForm
            product={editingProduct}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            isLoading={isSubmitting}
          />
        </Card>
      </div>
    );
  }

  // ---- List view ----
  return (
    <div ref={containerRef} className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-main">Meus produtos</h1>
          <p className="text-text-muted mt-1">
            Gerencie todo o inventário da sua garagem em um só lugar
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleCreate}
          leftIcon={<FontAwesomeIcon icon={faPlus} />}
        >
          Novo produto
        </Button>
      </div>

      {/* Filtros */}
      <Card flush>
        <div className="p-4 flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              placeholder="Buscar por nome, descrição ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
            />
          </div>
          <div className="flex gap-3">
            <div className="w-40">
              <Select
                aria-label="Ordenar por"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'date')}
                options={[
                  { value: 'name', label: 'Nome' },
                  { value: 'price', label: 'Preço' },
                  { value: 'date', label: 'Data' },
                ]}
              />
            </div>
            <div className="w-44">
              <Select
                aria-label="Ordem"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                options={[
                  { value: 'asc', label: 'Crescente (A–Z)' },
                  { value: 'desc', label: 'Decrescente (Z–A)' },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Loading */}
      {isLoading && (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-primary">
            <Spinner size="lg" />
            <p className="text-text-muted mt-3 text-sm">Carregando seus produtos...</p>
          </div>
        </Card>
      )}

      {/* Erro */}
      {!isLoading && error && (
        <Card>
          <EmptyState
            icon={<FontAwesomeIcon icon={faBoxOpen} />}
            title="Ops! Ocorreu um erro."
            description={error}
            action={
              <Button variant="primary" onClick={() => fetchProducts()}>
                Tentar novamente
              </Button>
            }
          />
        </Card>
      )}

      {/* Grade de produtos */}
      {!isLoading && !error && filteredProducts.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              totalItems={filteredProducts.length}
            />
          )}
        </>
      )}

      {/* Estados vazios */}
      {!isLoading && !error && filteredProducts.length === 0 && (
        <Card>
          {products.length > 0 ? (
            <EmptyState
              icon={<FontAwesomeIcon icon={faBoxOpen} />}
              title="Nenhum produto encontrado"
              description={`Não encontramos resultados para "${searchTerm}". Tente termos diferentes.`}
              action={
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Limpar busca
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<FontAwesomeIcon icon={faBoxOpen} />}
              title="Vamos começar?"
              description="Você ainda não tem produtos cadastrados. Adicione seu primeiro item para começar a vender!"
              action={
                <Button variant="primary" onClick={handleCreate} leftIcon={<FontAwesomeIcon icon={faPlus} />}>
                  Adicionar primeiro produto
                </Button>
              }
            />
          )}
        </Card>
      )}

      {/* Modal QR */}
      <Modal
        isOpen={!!qrProduct}
        onClose={() => setQrProduct(null)}
        title="QR Code do produto"
        size="md"
      >
        {qrProduct && (
          <QRCodeDisplay
            product={qrProduct}
            qrCodeUrl={qrProduct.qrCodeUrl}
            onPrint={() => window.print()}
            onDownload={() => handleDownloadPDF(qrProduct)}
          />
        )}
      </Modal>
    </div>
  );
}
