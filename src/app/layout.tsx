import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Process Scheduling Visualizer",
  description: "Visualize CPU scheduling algorithms interactively.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} role="document">
        <main id="main-content" tabIndex={-1} className="min-h-screen focus:outline-none">
          {children}
        </main>
      </body>
    </html>
  );
}
