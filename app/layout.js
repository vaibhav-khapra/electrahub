// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
// import Navbar from "./Components/Navbar"; // No longer directly imported here
import "./globals.css";
import LayoutClientWrapper from "./Components/LayoutClientWrapper"; // Import the new wrapper

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Electrahub - Online Electronics store",
  description: "Electrahub - Online Electronics store",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Wrap children with the client-side wrapper */}
        <LayoutClientWrapper>
          {children}
        </LayoutClientWrapper>
      </body>
    </html>
  );
}