let activeModalCount = 0;

/**
 * Trava o scroll do body e html quando um modal/drawer/galeria estiver aberto.
 * Suporta modais aninhados via contador global.
 */
export function lockScroll() {
  if (activeModalCount === 0) {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }
  activeModalCount++;
}

/**
 * Destrava o scroll do body e html quando todos os modais forem fechados.
 */
export function unlockScroll() {
  activeModalCount = Math.max(0, activeModalCount - 1);
  if (activeModalCount === 0) {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }
}
