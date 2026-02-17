import type { Metadata, Viewport } from 'next';
import { Inter, Cinzel, Amiri } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel' });
const amiri = Amiri({ weight: ['400', '700'], subsets: ['arabic'], variable: '--font-amiri' });

export const metadata: Metadata = {
  title: 'StoryRealm - Read Web Novels',
  description: 'Read web novels in your language',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en" className="overflow-x-hidden">
      <body className={`${inter.variable} ${cinzel.variable} ${amiri.variable} antialiased font-sans min-h-screen overflow-x-hidden overscroll-x-none`}>
        {children}
      </body>
    </html>
  );
}
