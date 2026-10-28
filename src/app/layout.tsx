import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AutoLogout } from "@/components/AutoLogout"; // <-- Import komponen

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Laporan Dinas - Internal", // Saya ganti judulnya agar lebih profesional
  description: "Platform Internal Monitoring & Pengarsipan Perjalanan Dinas",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AutoLogout /> {/* <-- Tambahkan komponen ini di paling atas body */}
        {children}
      </body>
    </html>
  );
}