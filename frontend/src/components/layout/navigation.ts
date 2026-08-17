import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faChartLine,
  faBox,
  faTags,
  faChartPie,
  faQrcode,
  faUser,
  faMagnifyingGlass,
  faBagShopping,
  faClockRotateLeft,
  faCalendarDays,
  faMapMarkerAlt,
} from '@fortawesome/free-solid-svg-icons';
import type { DashboardType } from '@/types';

export interface NavItem {
  label: string;
  path: string;
  icon: IconDefinition;
}

export interface NavGroup {
  heading: string;
  items: NavItem[];
}

/**
 * Configuração ÚNICA de navegação para cada modo (comprador/vendedor).
 * É consumida tanto pela BottomNav (mobile) quanto pela Sidebar (desktop),
 * eliminando a duplicação que existia entre BuyerSidebar e SellerSidebar.
 */
export const NAVIGATION: Record<DashboardType, NavGroup[]> = {
  seller: [
    {
      heading: 'Geral',
      items: [
        { label: 'Dashboard', path: '/seller/dashboard', icon: faChartLine },
        { label: 'Produtos', path: '/seller/products', icon: faBox },
        { label: 'Vendas', path: '/seller/sales', icon: faTags },
        { label: 'Eventos', path: '/seller/events', icon: faCalendarDays },
        { label: 'Locais', path: '/seller/locations', icon: faMapMarkerAlt },
      ],
    },
    {
      heading: 'Ferramentas',
      items: [
        { label: 'QR Codes', path: '/seller/qr-codes', icon: faQrcode },
        { label: 'Estatísticas', path: '/seller/analytics', icon: faChartPie },
      ],
    },
    {
      heading: 'Conta',
      items: [{ label: 'Perfil', path: '/seller/profile', icon: faUser }],
    },
  ],
  buyer: [
    {
      heading: 'Compras',
      items: [
        { label: 'Explorar', path: '/buyer/qr-scanner', icon: faMagnifyingGlass },
        { label: 'Minhas Compras', path: '/buyer/purchases', icon: faBagShopping },
        { label: 'Histórico', path: '/buyer/history', icon: faClockRotateLeft },
      ],
    },
    {
      heading: 'Conta',
      items: [{ label: 'Perfil', path: '/buyer/profile', icon: faUser }],
    },
  ],
};

/** Itens principais usados na bottom nav (máx 5) — os mais relevantes. */
export const BOTTOM_NAV: Record<DashboardType, NavItem[]> = {
  seller: [
    { label: 'Início', path: '/seller/dashboard', icon: faChartLine },
    { label: 'Produtos', path: '/seller/products', icon: faBox },
    { label: 'Vendas', path: '/seller/sales', icon: faTags },
    { label: 'Estatísticas', path: '/seller/analytics', icon: faChartPie },
    { label: 'Perfil', path: '/seller/profile', icon: faUser },
  ],
  buyer: [
    { label: 'Explorar', path: '/buyer/qr-scanner', icon: faMagnifyingGlass },
    { label: 'Compras', path: '/buyer/purchases', icon: faBagShopping },
    { label: 'Histórico', path: '/buyer/history', icon: faClockRotateLeft },
    { label: 'Perfil', path: '/buyer/profile', icon: faUser },
  ],
};

/** Caminho de destino ao trocar de modo. */
export const MODE_SWITCH: Record<DashboardType, { to: string; label: string }> = {
  seller: { to: '/buyer/qr-scanner', label: 'Modo Comprador' },
  buyer: { to: '/seller/dashboard', label: 'Modo Vendedor' },
};
