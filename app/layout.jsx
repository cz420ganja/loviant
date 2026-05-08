import "./globals.css";
import { AgeGate } from "../components/AgeGate";

export const metadata = {
  title: "Loviant",
  description: "AI companion image and video studio",
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
