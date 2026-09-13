import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Gedung",
  description: "Fondasi aplikasi administrasi gedung",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
