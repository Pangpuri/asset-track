"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  Wrench, 
  FileBarChart, 
  Home as HomeIcon,
  QrCode,
  Menu,
  X
} from "lucide-react";
import { Button } from "./ui/button";

const navItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "คลังอุปกรณ์",
    href: "/dashboard/assets",
    icon: Package,
  },
  {
    title: "รายการแจ้งซ่อม",
    href: "/dashboard/services",
    icon: Wrench,
  },
  {
    title: "รายงาน",
    href: "/dashboard/reports",
    icon: FileBarChart,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <QrCode size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block">
              Asset<span className="text-blue-600">Track</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                )}
              >
                <item.icon size={18} />
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* ปุ่ม Hamburger สำหรับมือถือ */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* เมนูสำหรับมือถือ (Mobile Menu Overlay) */}
      {isOpen && (
        <div className="md:hidden border-t bg-white p-4 space-y-2 animate-in slide-in-from-top duration-300">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                pathname === item.href 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
              )}
            >
              <item.icon size={20} />
              {item.title}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}