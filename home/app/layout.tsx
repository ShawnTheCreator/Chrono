import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chrono — The Flight Recorder for Autonomous AI Agents',
  description: 'Cryptographic append-only Merkle chain, LMAX ring buffer, and live causal narration for autonomous coding agents',
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
