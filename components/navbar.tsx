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
  Scan,
  PlusSquare,
  Search,
  Heart,
  User
} from "lucide-react";
import { Button } from "./ui/button";

const navItems = [
  {
    title: "Home",
    href: "/",
    icon: HomeIcon,
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
    <nav className="sticky top-0 z-[100] w-full border-b border-gray-200 bg-white">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 max-w-lg">
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-2 active:opacity-60">
          <span className="text-xl font-bold tracking-tight text-black">
            AssetTrack
          </span>
        </Link>

        {/* Right: Icons (IG Style) */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/assets/new" className="text-black active:opacity-50">
            <PlusSquare size={24} />
          </Link>
          <Link href="/scan" className="text-black active:opacity-50">
            <QrCode size={24} />
          </Link>
          <button 
            className="text-black active:opacity-50"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay - Fully Opaque */}
      {isOpen && (
        <div className="fixed inset-0 top-0 z-[110] bg-white animate-in slide-in-from-right duration-200">
          <div className="flex flex-col h-full">
            {/* Menu Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
              <span className="text-lg font-bold">Menu</span>
              <button 
                className="text-black active:opacity-50"
                onClick={() => setIsOpen(false)}
              >
                <X size={26} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-4 text-lg font-medium border-b border-gray-50 transition-colors active:bg-gray-50",
                    pathname === item.href ? "text-black font-bold" : "text-gray-500"
                  )}
                >
                  <item.icon size={22} strokeWidth={pathname === item.href ? 2.5 : 2} />
                  {item.title}
                </Link>
              ))}
            </div>
            
            <div className="p-8 text-center border-t border-gray-50 bg-gray-50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Developed by MIS Department
              </p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
