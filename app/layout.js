import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";

const inter = Inter({subsets: ['latin']});

export const metadata = {
  title: "Splitly",
  description: "A smart expense splitter",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logos/logo_s.png" sizes="any" />
      </head>
      <body
        className={`${inter.className}`}
      >
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
