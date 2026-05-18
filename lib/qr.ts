import QRCode from 'qrcode';

/**
 * สร้าง QR Code ในรูปแบบ Data URL (Base64)
 * @param assetId UUID ของอุปกรณ์
 * @returns Promise<string> Base64 image string
 */
export async function generateAssetQRCode(assetId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${baseUrl}/track/${assetId}`;
  
  try {
    return await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('QR Generation Error:', err);
    return '';
  }
}