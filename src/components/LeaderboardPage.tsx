"use client";
import { useEffect, useState } from "react";

interface LeaderEntry {
  username: string;
  points: number;
  rank: number;
}

export function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then(r => r.json())
      .then(d => { setLeaders(d.leaders ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="p-4 space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-white font-bold text-xl">🏆 本週排行榜</h2>
        <p className="text-gray-400 text-xs">前三名獲得 WLD 獎勵</p>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-10">載入中...</div>
      ) : leaders.length === 0 ? (
        <div className="text-center text-gray-500 py-10">還沒有資料，快去生成內容！</div>
      ) : (
        <div className="space-y-3">
          {leaders.map((entry, i) => (
            <div key={i} className={`flex items-center justify-between p-4 rounded-2xl ${i < 3 ? "bg-gradient-to-r from-yellow-900/30 to-gray-900" : "bg-gray-900"}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{medals[i] ?? `${i + 1}`}</span>
                <div>
                  <p className="text-white font-medium">{entry.username}</p>
                  <p className="text-gray-400 text-xs">排名 #{i + 1}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-yellow-400 font-bold">⭐ {entry.points}</p>
                {i < 3 && <p className="text-green-400 text-xs">WLD 獎勵</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gray-900 rounded-xl p-3 text-center">
        <p className="text-gray-400 text-xs">每週一 00:00 重置，前三名自動發放 WLD</p>
      </div>
    </div>
  );
}
