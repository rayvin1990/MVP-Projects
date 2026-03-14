import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TimeInvoice - Time Tracking & Invoicing for Freelancers",
  description: "Track your time, generate professional invoices, and get paid. Perfect for freelancers who bill by the hour.",
  keywords: ["time tracking", "invoicing", "freelancer", "billing", "hourly rate"],
  authors: [{ name: "TimeInvoice" }],
  openGraph: {
    title: "TimeInvoice - Time Tracking & Invoicing for Freelancers",
    description: "Track your time, generate professional invoices, and get paid.",
    type: "website",
    siteName: "TimeInvoice",
  },
  twitter: {
    card: "summary_large_image",
    title: "TimeInvoice - Time Tracking & Invoicing",
    description: "Track your time, generate professional invoices, and get paid.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Navigation */}
        <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                TimeInvoice
              </Link>

              {/* Nav Links */}
              <div className="flex items-center gap-8">
                <Link 
                  href="/" 
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  Home
                </Link>
                <Link 
                  href="/timer" 
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  Timer
                </Link>
                <Link 
                  href="/time-entries" 
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  Time Entries
                </Link>
                <Link 
                  href="/projects" 
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  Projects
                </Link>
                <Link 
                  href="/invoices" 
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  Invoices
                </Link>
                <Link 
                  href="/settings" 
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  Settings
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
