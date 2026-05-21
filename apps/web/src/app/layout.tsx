import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sino Ample | Smart Vending Machines for Global Businesses",
    template: "%s | Sino Ample"
  },
  description:
    "Sino Ample provides smart vending machines, OEM customization, and B2B vending solutions for global operators, distributors, and enterprise locations."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
