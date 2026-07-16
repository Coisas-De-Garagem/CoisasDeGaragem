import bgImage from '@/assets/bg-garage-sale.png';

interface BackgroundSceneProps {
  className?: string;
}

/**
 * Fundo com tema de "garage sale".
 * Usada como fundo esmaecido nas telas públicas (landing, login, registro).
 */
export function BackgroundScene({ className = '' }: BackgroundSceneProps) {
  return (
    <img
      src={bgImage}
      alt="Background"
      className={className}
      aria-hidden="true"
    />
  );
}
