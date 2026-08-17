import { useState } from 'react';
import { useLocations } from '@/hooks/useLocations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faChevronDown, faCheck } from '@fortawesome/free-solid-svg-icons';

interface LocationSelectProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

export function LocationSelect({ value, onChange, error }: LocationSelectProps) {
  const { locations } = useLocations();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Active locations only
  const activeLocations = locations.filter((loc) => loc.isActive);

  // Filter by search term
  const filteredLocations = activeLocations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // We want to show at most 5 initially if no search term, otherwise show filtered
  const displayedLocations = searchTerm ? filteredLocations : activeLocations.slice(0, 5);

  const selectedLocation = locations.find((l) => l.id === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full h-12 px-4 bg-surface text-text-main border rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors duration-200 text-left ${
          error ? 'border-red-500' : 'border-border-strong focus:border-primary'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-text-subtle" />
          <span className={`block truncate ${!selectedLocation ? 'text-text-subtle' : ''}`}>
            {selectedLocation ? selectedLocation.name : 'Selecione um local'}
          </span>
        </div>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`w-4 h-4 text-text-subtle transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-2 border-b border-border">
              <input
                type="text"
                placeholder="Buscar local..."
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <ul className="max-h-60 overflow-y-auto py-1">
              {displayedLocations.length === 0 ? (
                <li className="px-4 py-3 text-sm text-text-subtle text-center">Nenhum local encontrado</li>
              ) : (
                displayedLocations.map((loc) => {
                  const isSelected = value === loc.id;
                  return (
                    <li
                      key={loc.id}
                      onClick={() => {
                        onChange(loc.id);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      className={`relative cursor-default select-none py-3 pl-10 pr-4 text-sm hover:bg-background transition-colors ${
                        isSelected ? 'text-primary bg-primary/5 font-medium' : 'text-text-main'
                      }`}
                    >
                      <span className="block truncate">{loc.name}</span>
                      <span className="block truncate text-xs text-text-subtle mt-0.5">{loc.address}</span>
                      {isSelected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                          <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                        </span>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
