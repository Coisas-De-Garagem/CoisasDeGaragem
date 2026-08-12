import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMapMarkerAlt, faPencil, faPowerOff, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { useLocations } from '@/hooks/useLocations';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { DropdownSelect } from '@/components/common/DropdownSelect';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import { PageHeaderSkeleton } from '@/components/common/PageSkeletons';
import { LocationForm } from '@/components/seller/LocationForm';
import { useUIStore } from '@/store/uiStore';
import { makeNotifier } from '@/utils/notifications';
import type { Location } from '@/types';

export default function LocationsPage() {
  const { locations, isLoading, error, refreshLocations, toggleStatus } = useLocations();
  const { addNotification } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | undefined>(undefined);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  const notify = makeNotifier(addNotification);

  const filteredLocations = (locations || []).filter((loc) => {
    if (statusFilter === 'active' && !loc.isActive) return false;
    if (statusFilter === 'inactive' && loc.isActive) return false;
    if (searchTerm && !loc.name.toLowerCase().includes(searchTerm.toLowerCase()) && !loc.address.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setIsToggling(id);
    try {
      await toggleStatus(id);
      notify('success', 'Sucesso', `Local ${currentStatus ? 'desativado' : 'ativado'} com sucesso`);
    } catch (err) {
      notify('error', 'Erro', 'Erro ao alterar status do local');
    } finally {
      setIsToggling(null);
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingLocation(undefined);
    setIsFormOpen(true);
  };

  if (isLoading && locations.length === 0) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <PageHeaderSkeleton />
        <Card flush><div className="h-16 bg-surface-2" /></Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-main mb-2">Meus Locais</h1>
          <p className="text-text-subtle">Gerencie os locais dos seus Garage Sales</p>
        </div>
        <Button onClick={handleCreate} leftIcon={<FontAwesomeIcon icon={faPlus} />}>
          Novo Local
        </Button>
      </div>

      <Card flush overflowVisible className="relative z-40">
        <div className="p-4 flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              placeholder="Buscar por nome ou endereço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
            />
          </div>
          <div className="w-full md:w-48 z-20">
            <DropdownSelect
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as any)}
              options={[
                { value: 'all', label: 'Todos os Status' },
                { value: 'active', label: 'Ativos' },
                { value: 'inactive', label: 'Inativos' },
              ]}
            />
          </div>
        </div>
      </Card>

      {error ? (
        <Card className="p-8 text-center text-red-400 border-red-500/20 bg-red-500/5">
          <p>{error}</p>
          <Button variant="outline" className="mt-4" onClick={refreshLocations}>Tentar novamente</Button>
        </Card>
      ) : filteredLocations.length === 0 ? (
        <EmptyState
          icon={<FontAwesomeIcon icon={faMapMarkerAlt} />}
          title="Nenhum local encontrado"
          description={searchTerm || statusFilter !== 'all' ? 'Tente mudar os filtros de busca' : 'Você ainda não cadastrou nenhum local'}
          action={!searchTerm && statusFilter === 'all' ? <Button variant="primary" onClick={handleCreate}>Novo Local</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((loc) => (
            <Card key={loc.id} hoverable className="flex flex-col">
              <div className="p-5 flex-1 space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-lg font-bold text-text-main line-clamp-1">{loc.name}</h3>
                  <Badge variant={loc.isActive ? 'success' : 'gray'}>
                    <FontAwesomeIcon icon={loc.isActive ? faCheckCircle : faTimesCircle} className="mr-1.5" />
                    {loc.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                
                <p className="text-sm text-text-subtle line-clamp-2" title={loc.address}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 opacity-70" />
                  {loc.address}
                </p>
                
                <div className="text-xs text-text-muted">
                  {loc._count?.products || 0} produto(s) vinculado(s)
                </div>
              </div>
              
              <div className="px-5 py-3 border-t border-border bg-surface-2 flex justify-end gap-2 mt-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggle(loc.id, loc.isActive)}
                  disabled={isToggling === loc.id}
                  leftIcon={<FontAwesomeIcon icon={faPowerOff} />}
                  className={loc.isActive ? 'text-text-subtle hover:text-red-400' : 'text-text-subtle hover:text-primary'}
                >
                  {loc.isActive ? 'Desativar' : 'Ativar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(loc)}
                  leftIcon={<FontAwesomeIcon icon={faPencil} />}
                >
                  Editar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingLocation ? 'Editar Local' : 'Novo Local'}
      >
        <LocationForm
          location={editingLocation}
          onSuccess={() => setIsFormOpen(false)}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
    </div>
  );
}
