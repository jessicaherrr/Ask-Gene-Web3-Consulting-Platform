// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AskGene Web3 - Consultation Platform',
  description: 'Book blockchain consultations with experts',
}

// Import the client provider
import { Providers } from '@/components/providers'
// Import PaymentProvider from app folder
import { PaymentProvider } from './components/providers/PaymentProvider'
// Import Navigation component
import Navigation from './components/Navigation'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white`}>
        {/* Navigation Bar */}
        <Navigation />
        
        {/* Main Content */}
        <main className="min-h-screen">
          {/* Wrap with both providers */}
          <Providers>
            <PaymentProvider>
              {children}
            </PaymentProvider>
          </Providers>
        </main>
        
        {/* Footer */}
        <footer className="mt-12 bg-gradient-to-t from-gray-900/50 to-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-3 mb-4 md:mb-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                  <span className="text-xl">🧬</span>
                </div>
                <span className="text-xl font-bold text-white">AskGene Web3</span>
              </div>
              
              <div className="flex flex-wrap gap-6 text-sm">
                <a href="/terms" className="text-gray-300 hover:text-cyan-400 transition-colors">Terms</a>
                <a href="/privacy" className="text-gray-300 hover:text-cyan-400 transition-colors">Privacy</a>
                <a href="/docs" className="text-gray-300 hover:text-cyan-400 transition-colors">Docs</a>
                <a href="/contact" className="text-gray-300 hover:text-cyan-400 transition-colors">Contact</a>
                <a href="/twitter" className="text-gray-300 hover:text-cyan-400 transition-colors">Twitter</a>
                <a href="/discord" className="text-gray-300 hover:text-cyan-400 transition-colors">Discord</a>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
              <p>© 2026 AskGene Web3. All rights reserved. Built on Polygon.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}