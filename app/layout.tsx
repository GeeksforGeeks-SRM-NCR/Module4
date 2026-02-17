import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Advanced Buggy App",
  description: "A highly advanced website with intentional bugs for debugging practice.",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-black text-white antialiased selection:bg-purple-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
