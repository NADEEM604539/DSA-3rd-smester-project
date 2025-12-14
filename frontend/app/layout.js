import { Geist, Geist_Mono } from "next/font/google";
import { Merriweather } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { AuthProvider } from '@/lib/auth-context'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-serif",
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
});

export const metadata = {
  title: "Library Management System",
  description: "Your Literary Haven - Digital Library System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ClerkProvider>
        <AuthProvider>
          <body
            className={`${geistSans.variable} ${geistMono.variable} ${merriweather.variable} antialiased`}
          >
            {children}
          </body>
        </AuthProvider>
      </ClerkProvider>
    </html>
  );
}
