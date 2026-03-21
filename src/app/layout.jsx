import "./globals.css";

export const metadata = {
  title: "AI Showcase",
  description: "Showcasing the future of AI and web design",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
