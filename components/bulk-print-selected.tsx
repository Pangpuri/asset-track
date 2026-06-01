"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AssetForPrint {
  id: string;
  assetCode: string | null;
  qrData: string;
}

interface BulkPrintSelectedProps {
  selectedAssets: AssetForPrint[];
  onClear: () => void;
}

export function BulkPrintSelected({ selectedAssets, onClear }: BulkPrintSelectedProps) {
  const [isPreparing, setIsPreparing] = useState(false);

  const handleBulkPrint = () => {
    if (selectedAssets.length === 0) return;
    
    setIsPreparing(true);
    const windowPrint = window.open('', '', 'width=800,height=1000');
    
    if (windowPrint) {
      const stickersHTML = selectedAssets.map(asset => `
        <div class="sticker">
          <div class="qr-section">
            <img src="${asset.qrData}" alt="QR" />
          </div>
          <div class="info-section">
            <div class="dept-label">ฝ่าย MIS</div>
            <div class="asset-code">${asset.assetCode || "NEW-QR"}</div>
          </div>
        </div>
      `).join('');

      windowPrint.document.write(`
        <html>
          <head>
            <title>Print Bulk QR Codes</title>
            <style>
              @page { size: auto; margin: 0mm; }
              body { margin: 5mm; padding: 0; font-family: sans-serif; background: #f0f0f0; }
              .grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fill, 48mm); 
                gap: 2mm; 
                justify-content: center;
              }
              .sticker { 
                width: 48mm; 
                height: 28mm; 
                padding: 2mm;
                box-sizing: border-box;
                background: white;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 2mm;
                page-break-inside: avoid;
                border: 0.1mm solid #eee;
                color: black;
              }
              .qr-section { width: 22mm; flex-shrink: 0; }
              .qr-section img { width: 100%; height: auto; display: block; }
              .info-section { 
                display: flex; 
                flex-direction: column; 
                justify-content: center;
                text-align: left;
                flex-grow: 1;
                min-width: 0;
              }
              .dept-label { font-size: 7pt; font-weight: bold; margin-bottom: 0.5mm; }
              .asset-code { 
                fontSize: 11pt; 
                font-weight: 900; 
                line-height: 1;
                word-break: break-all;
              }
              @media print {
                body { margin: 0; background: none; }
                .grid { gap: 0; }
                .sticker { border: none; }
              }
            </style>
          </head>
          <body>
            <div class="grid">
              ${stickersHTML}
            </div>
            <script>
              setTimeout(() => { 
                window.print(); 
                window.close(); 
              }, 500);
            </script>
          </body>
        </html>
      `);
      windowPrint.document.close();
      setIsPreparing(false);
      toast.success(`สั่งพิมพ์อุปกรณ์ ${selectedAssets.length} รายการ เรียบร้อยแล้ว`);
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-indigo-600 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-6 border border-white/20 backdrop-blur-lg">
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-widest opacity-80">เลือกไว้</span>
          <span className="text-xl font-black">{selectedAssets.length} <span className="text-sm font-medium">รายการ</span></span>
        </div>
        
        <div className="h-10 w-px bg-white/20" />
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            className="hover:bg-white/10 text-white font-bold rounded-xl"
            onClick={onClear}
          >
            ยกเลิก
          </Button>
          <Button 
            className="bg-white text-indigo-600 hover:bg-indigo-50 font-black rounded-xl gap-2 shadow-lg"
            onClick={handleBulkPrint}
            disabled={isPreparing}
          >
            {isPreparing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
            พิมพ์พร้อมกัน
          </Button>
        </div>
      </div>
    </div>
  );
}
