import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "TimeInvoice - Time Tracking & Invoicing for Freelancers",
  description: "Track your time, generate professional invoices, and get paid. Perfect for freelancers who bill by the hour.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, currentColor 2px, transparent 0)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 py-24 relative">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              TimeInvoice
            </h1>
            <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400">
              Track time. Generate invoice. Get paid.
            </p>
          </div>

          {/* CTA Button */}
          <div className="text-center mb-16">
            <Link
              href="/timer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full text-lg transition-all hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Tracking
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          {/* Target Users */}
          <div className="text-center mb-16">
            <p className="text-sm text-zinc-500 uppercase tracking-wider mb-2">
              Perfect for
            </p>
            <p className="text-lg text-zinc-700 dark:text-zinc-300">
              Freelancers who bill by the hour
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-zinc-900 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-16">
            Everything you need
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Time Tracking */}
            <div className="text-center p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <div className="w-16 h-16 mx-auto mb-6 bg-indigo-100 dark:bg-indigo-900 rounded-2xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                Time Tracking
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                One-click timer start. Track your work hours with precision and ease.
              </p>
            </div>

            {/* Feature 2: Time Entries */}
            <div className="text-center p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <div className="w-16 h-16 mx-auto mb-6 bg-emerald-100 dark:bg-emerald-900 rounded-2xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                Time Entries
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Organize and manage all your time logs. Know exactly where your time goes.
              </p>
            </div>

            {/* Feature 3: Invoicing */}
            <div className="text-center p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <div className="w-16 h-16 mx-auto mb-6 bg-amber-100 dark:bg-amber-900 rounded-2xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                One-Click Invoices
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Turn time entries into professional invoices instantly. Get paid faster.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 text-center text-zinc-500 text-sm">
          <p>© 2026 TimeInvoice. Built for freelancers.</p>
        </div>
      </div>
    </div>
  );
}
