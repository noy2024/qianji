import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { GlobalNavigation, Breadcrumb } from "@/components/navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "钱迹 - 智能账单管理",
  description: "个人财务管理和账单分析工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <div className="min-h-screen flex flex-col">
          <GlobalNavigation />
          <Breadcrumb />
          <main className="flex-1">
            {children}
          </main>
        </div>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
