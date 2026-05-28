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
  Shield,
  LogOut
} from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

const navItems = [
  { title: "หน้าแรก (Home)", href: "/", icon: HomeIcon },
  { title: "แดชบอร์ด (Dashboard)", href: "/dashboard", icon: LayoutDashboard },
  { title: "คลังอุปกรณ์ (Assets)", href: "/dashboard/assets", icon: Package },
  { title: "พิมพ์ QR (Bulk Print)", href: "/dashboard/assets/print-qr", icon: QrCode },
  { title: "จัดการการซ่อม (Repairs)", href: "/dashboard/assets/repairs", icon: RefreshCw },
  { title: "อุปกรณ์สูญหาย (Lost Assets)", href: "/dashboard/assets/lost", icon: Ghost }, 
  { title: "รายการจำหน่ายออก (Archive)", href: "/dashboard/assets/retired", icon: Trash2 },
  { title: "รายงาน PDF (Export)", href: "/dashboard/reports", icon: FileText },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const performCheck = async () => {
      try {
        const res = await fetch("/api/auth/simple");
        const data = await res.json();
        if (isMounted) setIsAuthenticated(data.authenticated);
      } catch (err) {
        if (isMounted) setIsAuthenticated(false);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    performCheck();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      // ถ้าสกอลลงมามากกว่า 20px ให้เปลี่ยนสถานะ
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/simple", {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("ออกจากระบบสำเร็จ");
        setIsAuthenticated(false);
        setIsOpen(false);
        window.location.href = "/";
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  return (
    <>
      {/* Main Navbar - Glassmorphism Dark */}
      <nav className={cn(
        "sticky top-0 z-[100] w-full border-b transition-all duration-300 print:hidden",
        isScrolled 
          ? "border-white/5 bg-black/60 backdrop-blur-xl" 
          : "border-transparent bg-black"
      )}>
        <div className="container mx-auto flex h-14 items-center justify-between px-4 max-w-lg">
          {/* Left: Brand - Luxury Glow */}
          <Link href="/" className="flex items-center gap-3 active:opacity-60 group">
            <div className="relative flex items-center justify-center w-9 h-9 bg-zinc-900 rounded-xl overflow-hidden group-active:scale-90 transition-transform shadow-2xl border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-500 opacity-80" />
              <Package size={20} className="text-white relative z-10" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-xl font-[1000] tracking-tighter text-white leading-none text-glow">
                ASSET<span className="text-indigo-300">TRACK</span>
              </span>
              <span className="text-[8px] font-black text-white tracking-[0.3em] uppercase">
                MIS Division
              </span>
            </div>
          </Link>

          {/* Right Area */}
          <div className="flex items-center gap-1.5">
            {!isLoading && !isAuthenticated ? (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 text-indigo-400 hover:bg-white/5 hover:text-white transition-all">
                  <Shield size={16} />
                  MIS Login
                </Button>
              </Link>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <Link href="/dashboard/assets/new" className="p-2 text-white/80 hover:text-white active:scale-90 transition-all">
                  <PlusSquare size={24} strokeWidth={2} />
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="p-2 text-rose-500/80 hover:text-rose-500 active:scale-90 transition-all"
                >
                  <LogOut size={22} strokeWidth={2} />
                </button>

                <button 
                  className="p-2 text-white/80 hover:text-white active:opacity-50 transition-opacity"
                  onClick={() => setIsOpen(true)}
                >
                  <Menu size={28} />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Side Drawer - Dark Luxury */}
      <div className={cn("fixed inset-0 z-[2000] flex justify-end transition-all duration-300", isOpen ? "visible" : "invisible")}>
        <div className={cn("absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ease-in-out", isOpen ? "opacity-100" : "opacity-0")} onClick={() => setIsOpen(false)} />
        <div className={cn("relative w-[80%] max-w-sm h-full bg-[#0A0A0A] border-l border-white/5 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col overflow-hidden", isOpen ? "translate-x-0" : "translate-x-full")}>
            <div className="flex items-center justify-between px-6 h-16 border-b border-white/5 bg-black pt-safe shrink-0">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white/20">MIS Navigation</span>
              <button onClick={() => setIsOpen(false)} className="text-white p-2 hover:bg-white/5 rounded-full transition-all active:scale-90">
                <X size={28} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className={cn("flex items-center gap-4 px-5 py-4 text-lg font-bold rounded-2xl transition-all active:scale-[0.97] duration-200", isActive ? "text-white bg-white/5 border border-white/10" : "text-white/40 hover:text-white hover:bg-white/5")}>
                    <item.icon size={24} className={cn("transition-transform duration-300", isActive && "scale-110 text-white")} strokeWidth={isActive ? 3 : 2} />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
            
            <div className="p-4 px-8 border-t border-white/5 bg-black/50">
               <button 
                 onClick={handleLogout}
                 className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-rose-500/10 text-rose-500 font-bold active:scale-[0.98] transition-all border border-rose-500/20"
               >
                 <LogOut size={20} />
                 <span>Sign Out</span>
               </button>
            </div>

            <div className="p-8 pb-[calc(2rem+env(safe-area-inset-bottom))] text-center bg-black shrink-0 border-t border-white/5">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Asset Tracking System</p>
              <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest">MIS Department v1.0</p>
            </div>
          </div>
        </div>
    </>
  );
}
