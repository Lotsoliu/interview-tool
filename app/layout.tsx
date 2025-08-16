import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '面试复盘助手',
  description: '使用豆包API分析面试表现，提供改进建议',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">面试复盘助手</h1>
            <p className="text-gray-600">记录面试过程，获得专业分析和改进建议</p>
          </header>
          {children}
        </div>
      </body>
    </html>
  )
}
