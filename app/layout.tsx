import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata = {
  title: "Student Mentorship System | Connect Students & Mentors",
  description:
    "An online mentorship platform that connects students with experienced mentors to guide academic and career growth.",
  keywords: [
    "mentorship app",
    "student mentorship system",
    "mentor platform",
    "online mentoring",
    "university mentorship",
  ],
  openGraph: {
    title: "Student Mentorship System",
    description:
      "Empowering students through one-on-one mentorship and guidance.",
    url: "https://mentorship-app-one.vercel.app",
    siteName: "Student Mentorship System",
    images: [
      {
        url: "https://mentorship-app-one.vercel.app/mentor.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
