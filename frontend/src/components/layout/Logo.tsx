interface LogoProps {
  className?: string;
}

/**
 * Marca do CoisasDeGaragem: logo oficial do sistema.
 */
export function Logo({ className = 'h-8 w-auto' }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="CoisasDeGaragem Logo"
      className={`${className} object-contain`}
    />
  );
}
