import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrepWise",
  description: "An AI powered platform for preparing for mock interviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${monaSans.className} antialiased bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen`}
      >
        {/* Animated gradient overlay */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-blue-900/20 pointer-events-none"></div>
        
        {/* Subtle grid pattern */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
        
        <Toaster 
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgb(15 23 42)',
              border: '1px solid rgb(51 65 85)',
              color: 'rgb(226 232 240)',
            },
          }}
        />
      </body>
    </html>
  );
}