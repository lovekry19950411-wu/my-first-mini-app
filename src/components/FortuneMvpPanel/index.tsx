"use client";

import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

type Props = {
    title?: string;
};

// 這是原本的保底運勢
const DEFAULT_FORTUNES = [
    '今日會有好運降臨，抓住機會！',
    '保持耐心，事情會慢慢改善。',
    '小心財務支出，謹慎理財。',
    '今天適合與朋友相聚，增進感情。',
    '專注在健康與休息，恢復元氣。',
];

const FortuneMvpPanel: React.FC<Props> = ({ title = 'AI 幸運面板' }) => {
    const [name, setName] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // AI 生成邏輯
    const handleGenerate = async () => {
        setLoading(true);
        const trimmedName = name.trim();
        
        try {
            // 如果你有設定 API KEY，就用 AI 生成
            const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
            
            if (apiKey) {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `你是一個占卜大師，請為${trimmedName || '一位朋友'}生成一句簡短且充滿智慧的今日運勢（20字以內）。`;
                
                const result = await model.generateContent(prompt);
                const aiFortune = result.response.text();
                setHistory((h) => [aiFortune, ...h].slice(0, 10));
            } else {
                // 如果沒 Key，就用原本的隨機邏輯（保底）
                const base = DEFAULT_FORTUNES[Math.floor(Math.random() * DEFAULT_FORTUNES.length)];
                const fortune = trimmedName ? `${trimmedName}，${base}` : base;
                setHistory((h) => [fortune, ...h].slice(0, 10));
            }
        } catch (error) {
            console.error("AI 生成失敗:", error);
            // 失敗時 fallback 到普通運勢
            const base = DEFAULT_FORTUNES[Math.floor(Math.random() * DEFAULT_FORTUNES.length)];
            setHistory((h) => [`(系統) ${base}`, ...h].slice(0, 10));
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => setHistory([]);

    return (
        <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8, maxWidth: 420, background: '#fff' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>{title}</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input
                    aria-label="name"
                    placeholder="輸入名稱（選填）"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 4, border: '1px solid #ccc', color: '#000' }}
                />
                <button 
                    onClick={handleGenerate} 
                    disabled={loading}
                    style={{ padding: '8px 12px', cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                    {loading ? '占卜中...' : 'AI 產生'}
                </button>
                <button onClick={handleClear} style={{ padding: '8px 12px' }}>
                    清除
                </button>
            </div>

            <div>
                {history.length === 0 ? (
                    <div style={{ color: '#666' }}>尚未產生任何運勢</div>
                ) : (
                    <ul style={{ paddingLeft: 18, margin: 0, color: '#222' }}>
                        {history.map((f, idx) => (
                            <li key={idx} style={{ marginBottom: 6 }}>{f}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default FortuneMvpPanel;