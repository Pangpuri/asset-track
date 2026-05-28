"use client";

import { useState, useEffect } from "react";
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
  PlusSquare,
  FileText,
  Trash2,
  RefreshCw,
  Ghost,
  Shield
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

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
  {
    title: "พิมพ์ QR (Bulk Print)",
    href: "/dashboard/assets/print-qr",
    icon: QrCode,
  },
  {
    title: "จัดการการซ่อม (Repairs)",
    href: "/dashboard/assets/repairs",
    icon: RefreshCw,
  },
  {
    title: "อุปกรณ์สูญหาย (Lost Assets)",
    href: "/dashboard/assets/lost",
    icon: Ghost,
  }, 
  {
    title: "รายการจำหน่ายออก (Archive)",
    href: "/dashboard/assets/retired",
    icon: Trash2,
  },
  {
    title: "รายงาน PDF (Export)",
    href: "/dashboard/reports",
    icon: FileText,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Main Navbar - Sticky */}
      <nav className="sticky top-0 z-[100] w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md print:hidden">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 max-w-lg">
          {/* Left: Brand - Modern IT Style */}
          <Link href="/" className="flex items-center gap-3 active:opacity-60 group">
            <div className="relative flex items-center justify-center w-9 h-9 bg-zinc-900 rounded-xl overflow-hidden group-active:scale-90 transition-transform shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 opacity-80" />
              <Package size={20} className="text-white relative z-10" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-xl font-[1000] tracking-tighter text-zinc-900 leading-none">
                ASSET<span className="text-indigo-600">TRACK</span>
              </span>
              <span className="text-[8px] font-black text-zinc-400 tracking-[0.3em] uppercase">
                MIS Division
              </span>
            </div>
          </Link>

          {/* Right Area: Dynamic based on Session */}
          <div className="flex items-center gap-2">
            {!isPending && !session ? (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 text-indigo-600 hover:bg-indigo-50">
                  <Shield size={16} />
                  MIS Login
                </Button>
              </Link>
            ) : session ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard/assets/new" className="active:scale-90 transition-transform hidden sm:flex">
                  <div className="p-[1.5px] rounded-lg bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                    <div className="bg-white rounded-[7px] p-1 flex items-center justify-center">
                      <PlusSquare size={18} className="text-zinc-900" />
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
            ) : null}
          </div>
        </div>
      </nav>

      {/* Side Drawer Menu - Moved outside of <nav> for better fixed positioning */}
      <div 
        className={cn(
          "fixed inset-0 z-[2000] flex justify-end transition-all duration-300",
          isOpen ? "visible" : "invisible"
        )}
      >
        {/* Backdrop - Darker for focus */}
        <div 
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ease-in-out",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsOpen(false)}
        />
        
        {/* Drawer Content - Solid Background */}
        <div 
          className={cn(
            "relative w-[80%] max-w-sm h-full bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col overflow-hidden",
            isOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
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
    </>
  );
}
