import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { ReactQueryProvider } from "@/lib/react-query/provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const funnelSans = localFont({
  src: [
    {
      path: "../../public/fonts/FunnelSans.ttf",
      style: "normal",
    },
    {
      path: "../../public/fonts/FunnelSans-Italic.ttf",
      style: "italic",
    },
  ],
  variable: "--font-funnel-sans",
});

const ultra = localFont({
  src: "../../public/fonts/Ultra-Regular.ttf",
  variable: "--font-ultra",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Axon",
  description: "Agentic AI framework for Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${funnelSans.variable} ${ultra.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            {children}
            <Toaster />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
