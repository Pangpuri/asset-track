"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
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
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-[100] w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 max-w-lg">
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-2 active:opacity-60">
          <span className="text-xl font-black tracking-tighter text-zinc-900">
            AssetTrack
          </span>
        </Link>

        {/* Right: Icons (IG Style) */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/assets/new" className="active:scale-90 transition-transform">
            <div className="p-[1.5px] rounded-lg bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
              <div className="bg-white rounded-[7px] p-1 flex items-center justify-center">
                <PlusSquare size={20} className="text-zinc-900" />
              </div>
            </div>
          </Link>
          <Link href="/scan" className="active:scale-90 transition-transform">
            <div className="p-[1.5px] rounded-lg bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
              <div className="bg-white rounded-[7px] p-1 flex items-center justify-center">
                <QrCode size={20} className="text-zinc-900" />
              </div>
            </div>
          </Link>
          <button 
            className="text-zinc-900 active:opacity-50"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu size={26} />
          </button>
        </div>
      </div>

      {/* Side Drawer Menu (65% Width) */}
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <div 
            className="fixed inset-0 z-[1000] bg-zinc-900/20 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="fixed top-0 right-0 bottom-0 z-[1001] w-[65%] bg-white shadow-2xl animate-in slide-in-from-right duration-300 border-l border-zinc-100 flex flex-col">
            {/* Menu Header */}
            <div className="flex items-center justify-between px-6 h-14 border-b border-zinc-50 pt-safe shrink-0">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Menu</span>
              <button onClick={() => setIsOpen(false)} className="text-zinc-900 p-2"><X size={24} /></button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4 pt-6 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 text-base font-bold rounded-2xl transition-all active:bg-zinc-50",
                    pathname === item.href ? "text-zinc-900 bg-zinc-50/50" : "text-zinc-400"
                  )}
                >
                  <item.icon size={20} strokeWidth={pathname === item.href ? 3 : 2} />
                  {item.title}
                </Link>
              ))}
            </div>
            
            <div className="p-8 pb-[calc(2rem+env(safe-area-inset-bottom))] text-center border-t border-zinc-50 bg-zinc-50/30">
              <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.3em]">
                MIS DEPARTMENT
              </p>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
