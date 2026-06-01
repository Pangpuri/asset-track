import React from 'react';

interface QRStickerProps {
  qrData: string;
  assetCode: string;
  id?: string;
}

/**
 * แม่แบบสติกเกอร์มาตรฐานขนาด 48x28mm (พิมพ์ด้วยเครื่อง Thermal)
 * ใช้ CSS ในการคุมขนาดเพื่อให้ตรงตามหน้างานจริง
 */
export function QRSticker({ qrData, assetCode, id }: QRStickerProps) {
  return (
    <div 
      id={id || `sticker-${assetCode}`}
      className="bg-white text-black print:block"
      style={{ 
        width: '48mm', 
        height: '28mm', 
        padding: '2mm',
        boxSizing: 'border-box',
        fontFamily: 'sans-serif',
        overflow: 'hidden',
        border: '0.1mm solid #eee', // สำหรับดูในจอภาพ
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2mm'
      }}
    >
      {/* QR Code Section */}
      <div style={{ width: '22mm', flexShrink: 0 }}>
        <img 
          src={qrData} 
          alt="QR" 
          style={{ width: '100%', height: 'auto', display: 'block' }} 
        />
      </div>

      {/* Info Section */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        textAlign: 'left',
        flexGrow: 1,
        minWidth: 0
      }}>
        <div style={{ fontSize: '7pt', fontWeight: 'bold', marginBottom: '0.5mm' }}>
          ฝ่าย MIS
        </div>
        <div style={{ 
          fontSize: '11pt', 
          fontWeight: '900', 
          lineHeight: '1',
          wordBreak: 'break-all'
        }}>
          {assetCode}
        </div>
      </div>
    </div>
  );
}
