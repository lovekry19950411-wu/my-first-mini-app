"use client";

import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

type Props = { title?: string; };

const FortuneMvpPanel: React.FC<Props> = ({ title = 'AI 幸運面板' }) => {
    const [name, setName] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
            if (apiKey) {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(`為${name || '我'}生成一句20字內的今日占卜。`);
                setHistory(h => [result.response.text(), ...h].slice(0, 5));
            } else {
                setHistory(h => [`今日大吉！${name}`, ...h].slice(0, 5));
            }
        } finally { setLoading(false); }
    };

    return (
        <div style={{ padding: 16, background: '#fff', borderRadius: 8, color: '#000' }}>
            <h3>{title}</h3>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="你的名字" style={{ border: '1px solid #ccc', marginRight: 8, padding: 4 }} />
            <button onClick={handleGenerate} disabled={loading}>{loading ? '生成中...' : '開始占卜'}</button>
            <ul>{history.map((f, i) => <li key={i}>{f}</li>)}</ul>
        </div>
    );
};

export default FortuneMvpPanel;