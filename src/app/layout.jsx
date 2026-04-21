import "./globals.css";
import Script from 'next/script';
import { Jersey_25, Quantico, Anta, Aldrich } from 'next/font/google';

const jersey25 = Jersey_25({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-jersey-25',
});

const quantico = Quantico({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-quantico',
});

const anta = Anta({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anta',
});

const aldrich = Aldrich({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-aldrich',
});

export const metadata = {
  title: "AI Showcase",
  description: "Showcasing the future of AI and web design",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jersey25.variable} ${quantico.variable} ${anta.variable} ${aldrich.variable}`}>
      <head>
        <Script 
          src="https://unpkg.com/@splinetool/viewer@1.0.51/build/spline-viewer.js" 
          type="module"
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
