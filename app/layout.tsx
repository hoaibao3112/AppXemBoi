import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cõi Vô Thường — Tarot Huyền Bí",
  description:
    "Bước vào Thánh Địa và khám phá những bí ẩn của vũ trụ qua bộ bài Tarot huyền bí. Gặp gỡ Vọng — người giữ cổng cõi sương mù ngàn năm.",
  keywords: ["tarot", "bói bài", "tâm linh", "cõi vô thường", "vọng"],
  openGraph: {
    title: "Cõi Vô Thường — Tarot Huyền Bí",
    description: "Khám phá những bí ẩn ẩn giấu trong từng lá bài Tarot",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${cinzel.variable} ${cormorant.variable} ${beVietnamPro.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
