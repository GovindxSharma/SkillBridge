// src/app/layout.tsx

import "./globals.css";
import { ReactNode } from "react";
import NavbarWrapper from "@/components/layouts/NavbarWrapper";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavbarWrapper />
        <Toaster />
        {children}
      </body>
    </html>
  );
}
