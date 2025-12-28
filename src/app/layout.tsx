import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rural Healthcare AI',
  description: 'AI-powered healthcare management for rural communities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="relative min-h-screen overflow-x-hidden">
          {/* Global Background Decorations */}
          <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-20 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px] animate-float-delayed" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-400/20 blur-[100px] animate-float" />
          </div>

          <main className="relative z-10 w-full max-w-[1920px] mx-auto">
            <Providers>
              {children}
            </Providers>
          </main>
        </div>
      </body>
    </html>
  );
}
