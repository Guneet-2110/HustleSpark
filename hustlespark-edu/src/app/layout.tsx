import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HustleSpark Education | Classroom Entrepreneurship Simulation",
  description:
    "A COPPA-compliant classroom entrepreneurship simulation for ages 9-13. Students generate hustle ideas with AI, create listings, and trade using classroom currency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
            <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p>© 2026 HustleSpark Education. Built for classrooms ages 9-13. COPPA Compliant.</p>
              <div className="flex items-center gap-4">
                <a href="/join" className="hover:underline">Student Join</a>
                <a href="/teacher/login" className="hover:underline">Teacher Portal</a>
                <a href="/admin" className="hover:underline">Admin</a>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
