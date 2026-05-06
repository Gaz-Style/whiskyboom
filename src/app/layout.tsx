import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Whiskyboom | Tienda de Whisky Premium en Argentina",
  description: "Descubrí la mejor selección de whiskies premium, single malt, blended y bourbon. Envíos a todo el país. Whisky raro y de colección.",
  keywords: "whisky, whiskey, single malt, bourbon, tienda de whisky, argentina, premium",
  openGraph: {
    title: "Whiskyboom | Tienda de Whisky Premium",
    description: "La mejor selección de whiskies premium en Argentina",
    type: "website",
    locale: "es_AR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.variable}>
        <AnnouncementBar />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
