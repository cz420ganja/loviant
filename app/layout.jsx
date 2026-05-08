import "./globals.css";
import { AgeGate } from "../components/AgeGate";

export const metadata = {
  title: "Loviant",
  description: "AI companion image and video studio",
  icons: {
    icon: "/images/loviant-tab-icon.png",
    shortcut: "/images/loviant-tab-icon.png",
    apple: "/images/loviant-tab-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <AgeGate />
      </body>
    </html>
  );
}
