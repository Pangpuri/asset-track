import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ 1. ยอมรับ Turbopack ตาม Next.js 16 แต่อาจจะต้องระบุเครื่องหมายให้ Webpack ทำงานร่วมกันได้
  turbopack: {}, 

  // ✅ 2. ตั้งค่าความปลอดภัยสำหรับ IP
  experimental: {
    serverActions: {
      allowedOrigins: ["192.168.10.141:3001", "localhost:3001", "127.0.0.1:3001"],
      bodySizeLimit: "10mb",
    },
  },

  // ✅ 3. ปรับแต่ง Webpack (ถึงแม้จะใช้ Turbopack ตัว Next.js จะพยายามเอาค่าบางอย่างไปใช้)
  webpack: (config, { dev, isServer }) => {
    return config;
  },

  // ✅ 4. ลบ Asset Prefix ออกเพื่อให้ Next.js จัดการเส้นทางอัตโนมัติ
  assetPrefix: undefined,
};

export default nextConfig;