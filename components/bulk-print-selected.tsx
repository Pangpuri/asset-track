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
            <div class="sticker-header">
              <img src="${asset.qrData}" alt="QR" class="qr-img" />
              <div class="asset-info">
                <div class="label">AssetID</div>
                <div class="value">${asset.assetCode || "NEW-QR"}</div>
              </div>
            </div>
            <div class="footer">ฝ่าย MIS</div>
        </div>
      `).join('');

      windowPrint.document.write(`
        <html>
          <head>
            <title>Print Bulk QR Codes</title>
            <style>
              body { font-family: sans-serif; margin: 0; padding: 20px; }
              .grid { display: grid; grid-template-columns: repeat(auto-fill, 170px); gap: 0; }
              .sticker { 
                width: 170px; 
                height: 95px;
                border: 1px solid black; 
                padding: 5px; 
                text-align: center;
                page-break-inside: avoid;
                background: white;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-sizing: border-box;
              }
              .sticker-header { display: flex; align-items: center; justify-content: center; gap: 8px; flex: 1; }
              .qr-img { width: 65px; height: 65px; }
              .asset-info { text-align: left; }
              .label { font-size: 8px; font-weight: bold; color: #666; }
              .value { font-size: 14px; font-weight: bold; color: black; }
              .footer { border-top: 0.5px solid #eee; padding-top: 2px; font-size: 8px; font-weight: bold; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="grid">
              ${stickersHTML}
            </div>
            <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
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
