"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { QRSticker } from "./qr-sticker";

interface QRPrintWrapperProps {
  qrData: string;
  assetCode: string;
}

export function QRPrintWrapper({ qrData, assetCode }: QRPrintWrapperProps) {
  const handlePrint = () => {
    const printContent = document.getElementById(`sticker-${assetCode}`);
    const windowPrint = window.open('', '', 'width=600,height=600');
    if (windowPrint && printContent) {
      windowPrint.document.write(`
        <html>
          <head>
            <title>Print Asset Sticker - ${assetCode}</title>
            <style>
              @page { size: 48mm 28mm; margin: 0; }
              body { margin: 0; padding: 0; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
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
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2"
        onClick={handlePrint}
      >
        <Printer className="h-4 w-4" /> พิมพ์สติกเกอร์
      </Button>

      {/* Hidden sticker for printing */}
      <div className="hidden">
        <QRSticker 
          qrData={qrData} 
          assetCode={assetCode} 
          id={`sticker-${assetCode}`} 
        />
      </div>
    </>
  );
}