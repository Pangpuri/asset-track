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
  X,
  Scan
} from "lucide-react";
import { Button } from "./ui/button";

const navItems = [
  {
    title: "หน้าแรก",
    href: "/",
    icon: HomeIcon,
  },
  {
    title: "สแกน QR",
    href: "/scan",
    icon: Scan,
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "คลังอุปกรณ์",
    href: "/dashboard/assets",
    icon: Package,
  },
  {
    title: "แจ้งซ่อม",
    href: "/dashboard/services",
    icon: Wrench,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-[100] w-full border-b border-indigo-100 bg-white/70 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 max-w-7xl">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all active:scale-95">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
              <QrCode size={20} />
            </div>
            <span className="text-xl font-black tracking-tight text-indigo-950">
              Asset<span className="text-blue-600">Track</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300",
                  pathname === item.href 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                    : "text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50"
                )}
              >
                <item.icon size={16} />
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Scan Button (Desktop Only) */}
          <Link href="/scan" className="hidden sm:block">
            <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold gap-2 shadow-lg shadow-indigo-100">
              <Scan size={18} />
              สแกนด่วน
            </Button>
          </Link>

          {/* Hamburger (Mobile Only) */}
          <div className="lg:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl text-indigo-600 hover:bg-indigo-50"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-white/95 backdrop-blur-md animate-in slide-in-from-top duration-300">
          <div className="p-6 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-black transition-all",
                  pathname === item.href 
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200" 
                    : "text-indigo-400 hover:bg-indigo-50"
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl",
                  pathname === item.href ? "bg-white/20" : "bg-indigo-50 text-indigo-600"
                )}>
                  <item.icon size={20} />
                </div>
                {item.title}
              </Link>
            ))}
            
            <div className="pt-6 border-t border-indigo-50 mt-6">
              <p className="text-[10px] text-center font-black text-indigo-200 uppercase tracking-[0.3em]">
                พัฒนาโดยฝ่าย MIS
              </p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
