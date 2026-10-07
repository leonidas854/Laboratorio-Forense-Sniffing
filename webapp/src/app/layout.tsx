import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Laboratorio 01 · Análisis de tráfico',
  description: 'Laboratorio educativo para comparar el transporte HTTP y HTTPS.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body>{children}</body></html>;
}
