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
          <div class="footer">พัฒนาโดยฝ่าย MIS</div>
        </div>
      `).join('');

      windowPrint.document.write(`
        <html>
          <head>
            <title>Print Bulk QR Codes</title>
            <style>
              body { font-family: sans-serif; margin: 0; padding: 20px; }
              .grid { 
                display: grid; 
                grid-template-columns: repeat(2, 1fr); 
                gap: 20px; 
              }
              .sticker { 
                width: 300px; 
                border: 2px solid black; 
                padding: 10px; 
                text-align: center;
                page-break-inside: avoid;
                margin-bottom: 10px;
                background: white;
              }
              .sticker-header { display: flex; align-items: center; justify-content: center; gap: 15px; }
              .qr-img { width: 120px; }
              .asset-info { text-align: left; }
              .label { font-size: 14px; font-weight: bold; }
              .value { font-size: 24px; font-weight: bold; color: black; }
              .footer { margin-top: 10px; border-top: 1px solid #ccc; padding-top: 5px; font-size: 12px; font-weight: bold; }
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
          <span className="text-xl font-black">${selectedAssets.length} <span className="text-sm font-medium">รายการ</span></span>
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
