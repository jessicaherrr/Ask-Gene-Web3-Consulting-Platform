import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers'; // 从 index.tsx 导入
import { PaymentProvider } from './components/providers/PaymentProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AskGene Web3 - Consultation Platform',
  description: 'Book blockchain consultations with experts',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <PaymentProvider>
            {children}
          </PaymentProvider>
        </Providers>
      </body>
    </html>
  );
}