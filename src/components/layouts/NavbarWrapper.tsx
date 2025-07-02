"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  // Hide Navbar on login & register pages
  const hiddenRoutes = ["/auth/login", "/auth/register"];
  const showNavbar = !hiddenRoutes.includes(pathname);

  return showNavbar ? <Navbar /> : null;
}
