"use client";
import { useState, useEffect } from "react";
import { MiniKit, PayCommandInput } from "@worldcoin/minikit-js";
import { NXZ_CONFIG } from "@/consts/config";
import dynamic from 'next/dynamic';

// 手動補上被移除的 tokenToDecimals 函數
const tokenToDecimals = (amount: number, decimals: number) => {
  return BigInt(Math.floor(amount * Math.pow(10, decimals))).toString();
};

const IDKitWidget = dynamic(
  () => import('@worldcoin/idkit').then((mod) => mod.IDKitWidget),
  { ssr: false }
);

export default function NXZCenter() {
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("MiniKit Initialized");
    }
  }, []);

  const handleVerifySuccess = (result: any) => {
    console.log("Verification Success:", result);
    setIsVerified(true);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-black text-white">
      <h1 className="text-3xl font-bold mb-8 text-blue-500">NXZ Asset Command Center</h1>
      
      {!isVerified ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-400">請先完成人身驗證以開啟權限</p>
          <IDKitWidget
            app_id={NXZ_CONFIG.WLD_APP_ID as `app_${string}`}
            action={NXZ_CONFIG.WLD_ACTION}
            onSuccess={handleVerifySuccess}
            handleVerify={(result) => {
               console.log("Proof received", result);
            }}
          >
            {({ open }) => (
              <button 
                onClick={open}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all"
              >
                Verify with World ID
              </button>
            )}
          </IDKitWidget>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-green-500 text-xl font-semibold">驗證成功！</p>
          <p className="mt-2 text-gray-300">資產管理功能已開啟</p>
        </div>
      )}
    </main>
  );
}