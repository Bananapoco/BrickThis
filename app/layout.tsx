import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";
import "cropperjs/dist/cropper.css";
import "swiper/css";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  title: "BRICKTHIS",
  description: "Turn your ideas into bricks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fredoka.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
