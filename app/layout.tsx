import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
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
  // Add verification here
  verification: {
    google: "ad5qznyVDSEjswNbs-W-wXgG2EAtYvnEM5-V-qBf4m0",
  },
  // Optional: Add other meta tags
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Search Console Verification */}
        <meta
          name="google-site-verification"
          content="ad5qznyVDSEjswNbs-W-wXgG2EAtYvnEM5-V-qBf4m0"
        />
      </head>
      <body className={`${geist.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
