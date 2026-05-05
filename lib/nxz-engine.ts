import OpenAI from "openai";

const nxzAI = new OpenAI({
  apiKey: process.env.QWEN_API_KEY,
  baseURL: process.env.QWEN_API_BASE,
});

export const getDailyFortune = async (address: string) => {
  if (!process.env.QWEN_API_KEY) {
    return "（詩籤服務未設定 QWEN_API_KEY）";
  }
  const completion = await nxzAI.chat.completions.create({
    model: "qwen-max",
    messages: [
      { role: "system", content: "你是 NXZ 系統。你負責為 Worldcoin 用戶提供基於區塊鏈數據的詩籤分析。語氣：冷峻、科技感、精準。" },
      { role: "user", content: `分析錢包地址 ${address} 的今日運勢，並給出一句 1 WLD 價值的智慧詩籤。` }
    ],
  });

  return completion.choices[0].message.content;
};