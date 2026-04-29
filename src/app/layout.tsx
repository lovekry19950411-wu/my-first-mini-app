"use client";

import React, { useState, useEffect } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

type FortuneResult = {
    text: string;
    advice: string;
    deepInsight: string;
    timestamp: string;
};

const POOL = [
    { text: "大吉：萬事亨通", advice: "今日適合開啟新計畫。", deepInsight: "星象顯示你的財運宮位正盛，建議在下午 3 點後進行決策，成功率極高。" },
    { text: "中吉：平穩進步", advice: "按部就班即可，不要焦慮。", deepInsight: "目前的停滯只是為了蓄力，建議保持規律作息，月中將有貴人相助。" },
    { text: "小吉：微光閃爍", advice: "注意身邊的小驚喜。", deepInsight: "今日適合與老友聯繫，對方不經意的一句話可能會解決你困擾已久的難題。" }
];

export const FortuneMvpPanel: React.FC = () => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [result, setResult] = useState<FortuneResult | null>(null);
    const [canDraw, setCanDraw] = useState(true);
    const [isPaid, setIsPaid] = useState(false);

    useEffect(() => {
        const lastDraw = localStorage.getItem('last_draw_date');
        const today = new Date().toDateString();
        if (lastDraw === today) {
            setCanDraw(false);
            const saved = localStorage.getItem('last_fortune');
            if (saved) setResult(JSON.parse(saved));
            if (localStorage.getItem('is_paid_today') === 'true') setIsPaid(true);
        }
    }, []);

    const handleDraw = () => {
        setIsDrawing(true);
        setTimeout(() => {
            const random = POOL[Math.floor(Math.random() * POOL.length)];
            const newRes = { ...random, timestamp: new Date().toLocaleTimeString() };
            setResult(newRes);
            setIsDrawing(false);
            setCanDraw(false);
            localStorage.setItem('last_draw_date', new Date().toDateString());
            localStorage.setItem('last_fortune', JSON.stringify(newRes));
        }, 1200);
    };

    const handlePayToUnlock = async () => {
        console.log("Pay button clicked");
        if (!MiniKit.isInstalled()) {
            console.error("MiniKit not installed");
            return;
        }

        try {
            const res = await fetch('/api/initiate-payment', { method: 'POST' });
            const { id } = await res.json();

            // 直接呼叫，不囉嗦，這次絕對能點
            const payload = {
                reference: id,
                to: "0xeb6782260F0B1E6360F6573C630D2E123f95fB60",
                tokens: [{ symbol: "WLD", amount: "0.1" }],
                description: "解鎖深度解析"
            };

            console.log("Sending payload:", payload);

            // 修正點：直接呼叫 MiniKit 內建的指令，不再透過有問題的類型包裝
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response = await (MiniKit.commands as any).pay(payload);
            
            if (response && response.finalPayload && response.finalPayload.status === 'success') {
                setIsPaid(true);
                localStorage.setItem('is_paid_today', 'true');
            }
        } catch (e) {
            console.error("Payment failed:", e);
        }
    };

    return (
        <div style={{ background: '#121212', borderRadius: '24px', padding: '24px', color: '#FFF', border: '1px solid #333' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '40px' }}>🔮</span>
                <h2 style={{ margin: '8px 0', fontSize: '20px', fontWeight: '700' }}>每日詩籤</h2>
            </div>

            <div style={{ background: '#1E1E1E', borderRadius: '16px', padding: '20px', marginBottom: '20px', minHeight: '120px', textAlign: 'center', border: '1px solid #2A2A2A' }}>
                {isDrawing ? "觀測星象中..." : result ? (
                    <div>
                        <div style={{ fontSize: '20px', color: '#0070F3', fontWeight: 'bold' }}>{result.text}</div>
                        <p style={{ color: '#CCC', fontSize: '15px' }}>{result.advice}</p>
                        
                        <div style={{ marginTop: '20px', padding: '15px', background: '#252525', borderRadius: '12px' }}>
                            {isPaid ? (
                                <div>
                                    <div style={{ color: '#FFD700', fontWeight: 'bold', marginBottom: '5px' }}>💎 深度解析</div>
                                    <p style={{ fontSize: '14px', color: '#EEE' }}>{result.deepInsight}</p>
                                </div>
                            ) : (
                                <div>
                                    <p style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>想知道更具體的建議嗎？</p>
                                    <button 
                                        onClick={handlePayToUnlock} 
                                        type="button"
                                        style={{ 
                                            background: '#FFD700', 
                                            color: '#000', 
                                            border: 'none', 
                                            padding: '12px 24px', 
                                            borderRadius: '20px', 
                                            fontWeight: 'bold', 
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            display: 'inline-block',
                                            zIndex: 999 // 確保它在最上層能被點到
                                        }}>
                                        支付 0.1 WLD 解鎖
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : "準備好迎接今日運勢了嗎？"}
            </div>

            <button onClick={handleDraw} disabled={!canDraw || isDrawing} style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: canDraw ? '#FFF' : '#2A2A2A', color: canDraw ? '#000' : '#555', fontWeight: 'bold', cursor: canDraw ? 'pointer' : 'not-allowed' }}>
                {canDraw ? "立即抽取" : "今日已抽取"}
            </button>
        </div>
    );
};