import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { ProductCard } from '@/components/seller/ProductCard';
import { ProductForm } from '@/components/seller/ProductForm';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Card } from '@/components/common/Card';
import { DropdownSelect } from '@/components/common/DropdownSelect';
import { EmptyState } from '@/components/common/EmptyState';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { CardGridSkeleton } from '@/components/common/PageSkeletons';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { QRCodeDisplay } from '@/components/seller/QRCodeDisplay';
import { useProducts } from '@/hooks/useProducts';
import { api } from '@/services/api';
import { useProductsStore } from '@/store/productsStore';
import { useUIStore } from '@/store/uiStore';
import { makeNotifier } from '@/utils/notifications';
import { generateProductPDF } from '@/utils/pdfGenerator';
import type { Product, CreateProductRequest, UpdateProductRequest } from '@/types';

export default function ProductsPage() {
  const { products, fetchProducts } = useProducts();
  const { addProduct, updateProduct, deleteProduct } = useProductsStore();
  const { addNotification } = useUIStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const [isFormOpen, setIsFormOpen] = useState(location.state?.showForm || false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrProduct, setQrProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const pageSize = 9;

  const notify = makeNotifier(addNotification);

  const filteredProducts = (products || []).filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = category === 'all' || product.category === category;
    
    return matchesSearch && matchesCategory;
  });

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
  }, [searchTerm, sortBy, sortOrder, category]);

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
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const result = await api.deleteProduct(productToDelete.id);
      if (result.success) {
        deleteProduct(productToDelete.id);
        notify('success', 'Produto excluído', 'O produto foi removido com sucesso.');
      } else {
        notify('error', 'Erro ao excluir', result.error?.message || 'Não foi possível excluir o produto.');
      }
    } catch {
      notify('error', 'Erro ao excluir', 'Ocorreu um erro inesperado ao excluir o produto.');
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
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
        notify('error', 'Erro ao gerar QR code', result.error?.message || 'Tente novamente.');
      }
    } catch {
      notify('error', 'Erro ao gerar QR code', 'Ocorreu um erro inesperado.');
    }
  };

  const handleDownloadPDF = async (product: Product) => {
    if (!product.qrCodeUrl) {
      notify('warning', 'QR code pendente', 'Gere o QR code antes de baixar o PDF.');
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
      notify('success', 'PDF gerado', 'O PDF do produto foi gerado com sucesso.');
    } catch {
      notify('error', 'Erro ao gerar PDF', 'Ocorreu um erro ao gerar o PDF.');
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

      if (result.success) {
        updateProduct(productId, result.data);
        notify('success', 'Status atualizado', 'O status do produto foi atualizado.');
      } else {
        notify('error', 'Erro ao alterar status', result.error?.message || 'Tente novamente.');
      }
    } catch {
      notify('error', 'Erro ao alterar status', 'Ocorreu um erro inesperado.');
    }
  };

  const handleSubmit = async (data: CreateProductRequest | UpdateProductRequest) => {
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        const result = await api.updateProduct(editingProduct.id, data as UpdateProductRequest);
        if (result.success) {
          updateProduct(editingProduct.id, result.data);
          setIsFormOpen(false);
          notify('success', 'Produto atualizado', 'As alterações foram salvas.');
        } else {
          notify('error', 'Erro ao atualizar', result.error?.message || 'Tente novamente.');
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
          setIsFormOpen(false);
          notify('success', 'Produto criado', 'O produto foi cadastrado com sucesso.');
        } else {
          notify('error', 'Erro ao criar produto', result.error?.message || 'Tente novamente.');
        }
      }
    } catch {
      notify('error', 'Erro ao salvar', 'Ocorreu um erro inesperado ao salvar o produto.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <Card flush overflowVisible className="relative z-40">
        <div className="p-4 flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              placeholder="Buscar por nome, descrição ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
            />
          </div>
          <div className="flex gap-3 flex-wrap sm:flex-nowrap">
            <div className="w-full sm:w-56 z-30">
              <DropdownSelect
                value={category}
                onChange={(v) => setCategory(v)}
                options={[
                  { value: 'all', label: 'Todas Categorias' },
                  { value: 'Brinquedos', label: 'Brinquedos' },
                  { value: 'Eletrônicos', label: 'Eletrônicos' },
                  { value: 'Móveis', label: 'Móveis' },
                  { value: 'Roupas', label: 'Roupas' },
                  { value: 'Livros', label: 'Livros' },
                  { value: 'Esportes', label: 'Esportes' },
                  { value: 'Outros', label: 'Outros' },
                ]}
              />
            </div>
            <div className="w-full sm:w-48 z-20">
              <DropdownSelect
                value={sortBy}
                onChange={(v) => setSortBy(v as 'name' | 'price' | 'date')}
                options={[
                  { value: 'name', label: 'Ordernar: Nome' },
                  { value: 'price', label: 'Ordernar: Preço' },
                  { value: 'date', label: 'Ordernar: Data' },
                ]}
              />
            </div>
            <div className="w-full sm:w-56 z-10">
              <DropdownSelect
                value={sortOrder}
                onChange={(v) => setSortOrder(v as 'asc' | 'desc')}
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
      {isLoading && <CardGridSkeleton count={9} />}

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

      {/* Modal: criar/editar produto */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingProduct ? 'Editar produto' : 'Novo produto'}
        size="lg"
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
        title="Excluir produto"
        description={`Tem certeza que deseja excluir "${productToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Sim, excluir"
        danger
        isLoading={isDeleting}
      />
    </div>
  );
}
