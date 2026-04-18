import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

import { ToastProvider } from '../context/ToastContext'
import Toast from '../components/Toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RepoInsight | AI GitHub Portfolio Reviewer',
  description: 'Analyze your GitHub like a recruiter with AI-powered insights.',
  icons: {
    icon: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#F7F3ED] text-[#2A2116] min-h-screen flex flex-col">
        <ToastProvider>
          <Header />
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
          <Toast />
        </ToastProvider>
      </body>
    </html>
  )
}
