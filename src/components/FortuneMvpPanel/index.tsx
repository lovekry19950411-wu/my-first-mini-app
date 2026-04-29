"use client";

import React, { useState, useEffect } from 'react';

type FortuneResult = {
    text: string;
    advice: string;
    timestamp: string;
};

const POOL = [
    { text: "大吉：萬事亨通", advice: "今日適合開啟新計畫，勇獲 World ID 能量。" },
    { text: "中吉：平穩進步", advice: "按部就班即可，不要過度焦慮，穩紮穩打。" },
    { text: "小吉：微光閃爍", advice: "注意身邊的小驚喜，今日適合與好友分享。" },
    { text: "吉：順風順水", advice: "保持耐心，好消息就在路上的轉角等著你。" },
    { text: "平：靜待時機", advice: "今日宜休息，適合整理內心與環境再出發。" }
];

export const FortuneMvpPanel: React.FC = () => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [result, setResult] = useState<FortuneResult | null>(null);
    const [canDraw, setCanDraw] = useState(true);

    // 檢查今天是否已經抽過
    useEffect(() => {
        const lastDraw = localStorage.getItem('last_draw_date');
        const today = new Date().toDateString();
        if (lastDraw === today) {
            setCanDraw(false);
            const savedResult = localStorage.getItem('last_fortune');
            if (savedResult) setResult(JSON.parse(savedResult));
        }
    }, []);

    const handleDraw = () => {
        if (!canDraw) return;
        
        setIsDrawing(true);
        setTimeout(() => {
            const random = POOL[Math.floor(Math.random() * POOL.length)];
            const newResult = {
                ...random,
                timestamp: new Date().toLocaleTimeString()
            };
            
            setResult(newResult);
            setIsDrawing(false);
            setCanDraw(false);
            
            // 存入 LocalStorage 限制一天一次
            localStorage.setItem('last_draw_date', new Date().toDateString());
            localStorage.setItem('last_fortune', JSON.stringify(newResult));
        }, 1500);
    };

    return (
        <div style={{
            background: '#121212', // 深色背景
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            maxWidth: '100%',
            margin: '16px auto',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: '#FFFFFF',
            border: '1px solid #333'
        }}>
            {/* 標題 */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔮</div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>每日詩籤</h2>
                <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
                    {canDraw ? "探索今日的宇宙能量" : "今日能量已領取，明天再來"}
                </p>
            </div>

            {/* 結果展示區 (深色層次) */}
            <div style={{
                minHeight: '160px',
                background: '#1E1E1E',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                marginBottom: '20px',
                border: '1px solid #2A2A2A'
            }}>
                {isDrawing ? (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: '#0070F3', fontWeight: '600', animation: 'pulse 1.5s infinite' }}>正在觀測星象...</p>
                    </div>
                ) : result ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '22px', fontWeight: '800', color: '#0070F3', marginBottom: '10px' }}>{result.text}</div>
                        <div style={{ fontSize: '15px', color: '#CCC', lineHeight: '1.6' }}>{result.advice}</div>
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '12px' }}>抽取時間：{result.timestamp}</div>
                    </div>
                ) : (
                    <p style={{ color: '#555' }}>準備好領取今日的運勢了嗎？</p>
                )}
            </div>

            {/* 按鈕 (一天一次邏輯) */}
            <button
                onClick={handleDraw}
                disabled={!canDraw || isDrawing}
                style={{
                    width: '100%',
                    padding: '16px',
                    background: (!canDraw || isDrawing) ? '#2A2A2A' : '#FFFFFF',
                    color: (!canDraw || isDrawing) ? '#555' : '#000000',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: (!canDraw || isDrawing) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: canDraw ? '0 4px 15px rgba(255,255,255,0.1)' : 'none'
                }}
            >
                {isDrawing ? '讀取中...' : canDraw ? '立即抽取今日詩籤' : '今日已完成抽取'}
            </button>

            {/* 合規免責聲明 */}
            <p style={{
                fontSize: '11px',
                color: '#555',
                textAlign: 'center',
                marginTop: '20px',
                lineHeight: '1.4'
            }}>
                免責聲明：本內容僅供娛樂參考，不構成任何醫療、法律或投資建議。
            </p>
            
            <style jsx>{`
                @keyframes pulse {
                    0% { opacity: 0.5; }
                    50% { opacity: 1; }
                    100% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};