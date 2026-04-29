"use client";

import React, { useState } from 'react';

// 1. 定義抽籤結果的結構
type FortuneResult = {
    text: string;
    advice: string;
    timestamp: string;
};

const POOL = [
    { text: "大吉：萬事亨通", advice: "今日適合開啟新計畫，勇往直前。" },
    { text: "中吉：平穩進步", advice: "按部就班即可，不要過度焦慮。" },
    { text: "小吉：微光閃爍", advice: "注意身邊的小驚喜，適合與友聚會。" },
    { text: "吉：順風順水", advice: "保持耐心，好消息就在路上的轉角。" },
    { text: "平：靜待時機", advice: "今日宜休息，適合整理內心與環境。" }
];

export const FortuneMvpPanel: React.FC = () => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [result, setResult] = useState<FortuneResult | null>(null);

    const handleDraw = () => {
        setIsDrawing(true);
        // 模擬「抽籤中」的動畫儀式感 (1.5秒)
        setTimeout(() => {
            const random = POOL[Math.floor(Math.random() * POOL.length)];
            setResult({
                ...random,
                timestamp: new Date().toLocaleTimeString()
            });
            setIsDrawing(false);
        }, 1500);
    };

    return (
        <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            maxWidth: '100%',
            margin: '16px auto',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            {/* 標題與視覺 */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔮</div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A', margin: 0 }}>每日詩籤</h2>
                <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>探索今日的宇宙能量</p>
            </div>

            {/* 結果展示區 */}
            <div style={{
                minHeight: '160px',
                background: '#F8F9FA',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                marginBottom: '20px',
                border: '1px dashed #E0E0E0'
            }}>
                {isDrawing ? (
                    <div style={{ textAlign: 'center' }}>
                        <div className="animate-spin" style={{ fontSize: '24px' }}>⏳</div>
                        <p style={{ color: '#0070F3', fontWeight: '600', marginTop: '8px' }}>正在窺探天機...</p>
                    </div>
                ) : result ? (
                    <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease-in' }}>
                        <div style={{ fontSize: '22px', fontWeight: '800', color: '#0070F3', marginBottom: '8px' }}>{result.text}</div>
                        <div style={{ fontSize: '15px', color: '#444', lineHeight: '1.6' }}>{result.advice}</div>
                        <div style={{ fontSize: '11px', color: '#999', marginTop: '12px' }}>抽取時間：{result.timestamp}</div>
                    </div>
                ) : (
                    <p style={{ color: '#999' }}>點擊下方按鈕，抽取今日運勢</p>
                )}
            </div>

            {/* 交互按鈕 */}
            <button
                onClick={handleDraw}
                disabled={isDrawing}
                style={{
                    width: '100%',
                    padding: '16px',
                    background: isDrawing ? '#CCC' : '#000',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: isDrawing ? 'not-allowed' : 'pointer',
                    transition: 'transform 0.1s active',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
            >
                {isDrawing ? '感應中...' : '立即抽取今日詩籤'}
            </button>

            {/* 合規免責聲明 */}
            <p style={{
                fontSize: '11px',
                color: '#BBB',
                textAlign: 'center',
                marginTop: '20px',
                lineHeight: '1.4'
            }}>
                免責聲明：本內容僅供娛樂參考，不構成任何醫療、法律或投資建議。
            </p>
        </div>
    );
};