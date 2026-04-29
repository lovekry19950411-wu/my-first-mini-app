"use client";

import React, { useState } from 'react';

/**
 * 修正說明：
 * 這裡使用 Named Export (具名匯出)，確保與 page.tsx 中的匯入方式完全匹配。
 */

type Props = {
    title?: string;
};

const DEFAULT_FORTUNES = [
    '今日會有好運降臨，抓住機會！',
    '保持耐心，事情會慢慢改善。',
    '小心財務支出，謹慎理財！',
    '今天適合與朋友相聚，增進感情。',
    '專注在健康與休息，恢復元氣。',
    '心中所想之事，今日將有轉機。',
    '跨出舒適圈，驚喜就在前方。'
];

export const FortuneMvpPanel: React.FC<Props> = ({ title = '每日詩籤' }) => {
    const [name, setName] = useState('');
    const [history, setHistory] = useState<string[]>([]);

    const handleGenerate = () => {
        const randomIndex = Math.floor(Math.random() * DEFAULT_FORTUNES.length);
        const base = DEFAULT_FORTUNES[randomIndex];
        const fortune = name.trim() ? `${name.trim()}，${base}` : base;
        setHistory((h) => [fortune, ...h].slice(0, 10));
    };

    const handleClear = () => setHistory([]);

    return (
        <div style={{ 
            border: '1px solid #ddd', 
            padding: '20px', 
            borderRadius: '12px', 
            maxWidth: '420px', 
            background: '#ffffff',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            color: '#333'
        }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>{title}</h3>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                    aria-label="name"
                    placeholder="輸入名稱"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ 
                        flex: 1, 
                        padding: '10px', 
                        borderRadius: '6px', 
                        border: '1px solid #ccc',
                        fontSize: '14px',
                        color: '#000'
                    }}
                />
                <button 
                    onClick={handleGenerate}
                    style={{ 
                        padding: '10px 16px', 
                        background: '#000', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    抽取
                </button>
                <button 
                    onClick={handleClear}
                    style={{ 
                        padding: '10px 16px', 
                        background: '#eee', 
                        color: '#666', 
                        border: 'none', 
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    清除
                </button>
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '12px' }}>
                {history.length === 0 ? (
                    <div style={{ color: '#999', textAlign: 'center', padding: '10px 0' }}>
                        尚未抽取今日詩籤
                    </div>
                ) : (
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        {history.map((f, idx) => (
                            <li key={idx} style={{ marginBottom: '8px', color: idx === 0 ? '#000' : '#666', fontWeight: idx === 0 ? '600' : 'normal' }}>
                                {f}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};