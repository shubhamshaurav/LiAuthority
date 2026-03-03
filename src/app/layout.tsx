import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { ReferralTracker } from '@/components/dashboard/ReferralTracker';
import { ThemeProvider } from '@/lib/theme-context';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LiAuthority | Professional LinkedIn Authority Builder",
  description: "Build real professional authority on LinkedIn with autonomous AI agents. Schedule, automate, and grow your LinkedIn presence with LiAuthority.",
  keywords: ["LinkedIn Authority", "AI LinkedIn Agent", "LinkedIn Automation", "Personal Branding AI", "Content Strategy"],
  authors: [{ name: "LiAuthority Team" }],
  openGraph: {
    title: "LiAuthority | Professional LinkedIn Authority Builder",
    description: "Build real professional authority on LinkedIn with autonomous AI agents.",
    url: "https://liauthority.com", // Replace with actual production URL if available
    siteName: "LiAuthority",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "LiAuthority Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LiAuthority | Professional LinkedIn Authority Builder",
    description: "Build real professional authority on LinkedIn with autonomous AI agents.",
    images: ["/logo.png"],
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
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
        <ThemeProvider>
          <Toaster position="top-center" richColors />
          <ReferralTracker />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
