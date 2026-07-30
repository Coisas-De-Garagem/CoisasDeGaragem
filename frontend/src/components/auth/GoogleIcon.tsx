/**
 * Logotipo "G" do Google em SVG (cores oficiais). Usado no botão de login
 * social. Não depende do pacote brand do Font Awesome.
 */
export function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.58 14.99 1 12 1 7.35 1 3.37 3.68 1.43 7.6l3.82 2.96C6.18 7.37 8.87 5.04 12 5.04z"
      />
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.47h6.47c-.28 1.47-1.11 2.71-2.35 3.55l3.66 2.84c2.14-1.97 3.71-4.88 3.71-8.52z"
      />
      <path
        fill="#FBBC05"
        d="M5.25 14.76c-.25-.76-.39-1.57-.39-2.41s.14-1.65.39-2.41L1.43 7.6C.52 9.43 0 11.53 0 13.75s.52 4.32 1.43 6.15l3.82-2.96c-.25-.76-.39-1.57-.39-2.41z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.32 1.09-4.3 1.09-3.13 0-5.82-2.33-6.77-5.52l-3.82 2.96C3.37 20.32 7.35 23 12 23z"
      />
    </svg>
  );
}
