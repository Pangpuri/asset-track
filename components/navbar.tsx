"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  Home as HomeIcon,
  QrCode,
  Menu,
  X,
  PlusSquare
} from "lucide-react";

const navItems = [
  {
    title: "หน้าแรก (Home)",
    href: "/",
    icon: HomeIcon,
  },
  {
    title: "แดชบอร์ด (Dashboard)",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "คลังอุปกรณ์ (Assets)",
    href: "/dashboard/assets",
    icon: Package,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Main Navbar - Sticky */}
      <nav className="sticky top-0 z-[100] w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 max-w-lg">
          {/* Left: Brand */}
          <Link href="/" className="flex items-center gap-2 active:opacity-60">
            <span className="text-xl font-black tracking-tighter text-zinc-900">
              AssetTrack
            </span>
          </Link>

          {/* Right: Icons */}
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
              className="text-zinc-900 active:opacity-50 p-1"
              onClick={() => setIsOpen(true)}
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* Side Drawer Menu - Moved outside of <nav> for better fixed positioning */}
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex justify-end">
          {/* Backdrop - Darker for focus */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer Content - Solid Background */}
          <div className="relative w-[80%] max-w-sm h-full bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col overflow-hidden">
            {/* Menu Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-zinc-100 bg-white pt-safe shrink-0">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">MIS Navigation</span>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-black p-2 hover:bg-zinc-100 rounded-full transition-all active:scale-90"
              >
                <X size={28} />
              </button>
            </div>

            {/* Menu Items List */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 bg-white">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-5 py-4 text-lg font-bold rounded-2xl transition-all active:scale-[0.97] duration-200",
                      isActive 
                        ? "text-black bg-zinc-100 border border-zinc-200" 
                        : "text-zinc-500 hover:text-black hover:bg-zinc-50"
                    )}
                  >
                    <item.icon 
                      size={24} 
                      className={cn("transition-transform duration-300", isActive && "scale-110 text-black")}
                      strokeWidth={isActive ? 3 : 2} 
                    />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
            
            {/* Footer */}
            <div className="p-8 pb-[calc(2rem+env(safe-area-inset-bottom))] text-center border-t border-zinc-100 bg-zinc-50 shrink-0">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-1">
                Asset Tracking System
              </p>
              <p className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest">
                MIS Department v1.0
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
