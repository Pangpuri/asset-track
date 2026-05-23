"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

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
          <head><title>Print Asset Sticker - ${assetCode}</title></head>
          <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
            ${printContent.innerHTML}
            <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
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

      <div id={`sticker-${assetCode}`} className="hidden">
        <div style={{ 
          width: '300px', 
          border: '2px solid black', 
          padding: '10px', 
          fontFamily: 'sans-serif',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
            <img src={qrData} alt="QR" style={{ width: '120px' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>ฝ่าย MIS</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{assetCode}</div>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}